import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Room = { id: string; members: string[]; createdAt: number; expiresAt: number; redirectTo?: string };
const roomsFile = path.join(process.cwd(), "data", "rooms", "rooms.json");

function readRooms(): Record<string, Room> {
  try { return JSON.parse(fs.readFileSync(roomsFile, "utf8")) as Record<string, Room>; }
  catch { return {}; }
}

function writeRooms(rooms: Record<string, Room>) {
  const directory = path.dirname(roomsFile);
  fs.mkdirSync(directory, { recursive: true });
  const temporaryFile = `${roomsFile}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify(rooms), "utf8");
  fs.renameSync(temporaryFile, roomsFile);
}

function withRoomLock<T>(operation: (rooms: Record<string, Room>) => T): T {
  fs.mkdirSync(path.dirname(roomsFile), { recursive: true });
  const lockFile = `${roomsFile}.lock`;
  const deadline = Date.now() + 3000;
  let lock: number | undefined;
  while (lock === undefined) {
    try { lock = fs.openSync(lockFile, "wx"); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      try {
        if (Date.now() - fs.statSync(lockFile).mtimeMs > 10000) fs.unlinkSync(lockFile);
      } catch { /* Another request released the lock. */ }
      if (Date.now() >= deadline) throw new Error("Movie Night is busy. Please try again.");
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10);
    }
  }
  try {
    const rooms = readRooms();
    cleanExpired(rooms);
    const result = operation(rooms);
    writeRooms(rooms);
    return result;
  } finally {
    fs.closeSync(lock);
    try { fs.unlinkSync(lockFile); } catch { /* The lock may already be gone. */ }
  }
}

function cleanExpired(rooms: Record<string, Room>) {
  const now = Date.now();
  for (const [id, room] of Object.entries(rooms)) if (room.expiresAt <= now) delete rooms[id];
}

function canonicalRoom(id: string, rooms: Record<string, Room>) {
  let room = rooms[id];
  const visited = new Set<string>();
  while (room?.redirectTo && !visited.has(room.id)) {
    visited.add(room.id);
    room = rooms[room.redirectTo];
  }
  return room;
}

export function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("room")?.toUpperCase() ?? "";
  const rooms = readRooms();
  const original = rooms[id];
  const existing = canonicalRoom(id, rooms);
  if (existing && existing.expiresAt > Date.now()) return NextResponse.json({ room: existing });
  if (original) return NextResponse.json({ room: null, error: "This room has expired." });
  if (!/^[A-Z0-9]{4,10}$/.test(id)) return NextResponse.json({ room: null, error: "That invite code is invalid." });
  return withRoomLock(rooms => {
    let room = rooms[id];
    if (!room) {
      const now = Date.now();
      room = { id, members: [], createdAt: now, expiresAt: now + 24 * 60 * 60 * 1000 };
      rooms[id] = room;
    }
    return NextResponse.json({ room });
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return withRoomLock(rooms => {

  if (body.action === "create") {
    let id = "";
    do { id = Math.random().toString(36).slice(2, 8).toUpperCase(); } while (rooms[id]);
    const now = Date.now();
    const room: Room = { id, members: [], createdAt: now, expiresAt: now + 24 * 60 * 60 * 1000 };
    rooms[id] = room;
    writeRooms(rooms);
    return NextResponse.json({ room });
  }

  if (body.action === "reset") {
    const id = typeof body.room === "string" ? body.room.toUpperCase() : "";
    if (!/^[A-Z0-9]{4,10}$/.test(id)) return NextResponse.json({ error: "That invite code is invalid." }, { status: 400 });
    const now = Date.now();
    const current = canonicalRoom(id, rooms);
    const canonicalId = current?.id ?? id;
    const room: Room = current ?? { id: canonicalId, members: [], createdAt: now, expiresAt: now + 24 * 60 * 60 * 1000 };
    room.members = [];
    room.createdAt = now;
    room.expiresAt = now + 24 * 60 * 60 * 1000;
    rooms[canonicalId] = room;
    return NextResponse.json({ room });
  }

  if (body.action === "merge") {
    const sourceId = typeof body.source === "string" ? body.source.toUpperCase() : "";
    const targetId = typeof body.target === "string" ? body.target.toUpperCase() : "";
    if (!/^[A-Z0-9]{4,10}$/.test(sourceId) || !/^[A-Z0-9]{4,10}$/.test(targetId) || sourceId === targetId) {
      return NextResponse.json({ error: "Those room codes cannot be combined." }, { status: 400 });
    }
    const now = Date.now();
    const source = canonicalRoom(sourceId, rooms);
    const target = canonicalRoom(targetId, rooms) ?? { id: targetId, members: [], createdAt: now, expiresAt: now + 24 * 60 * 60 * 1000 };
    rooms[targetId] = target;
    for (const member of source?.members ?? []) if (!target.members.some(existing => existing.toLocaleLowerCase() === member.toLocaleLowerCase())) target.members.push(member);
    target.expiresAt = Math.max(target.expiresAt, source?.expiresAt ?? 0);
    if (source) rooms[sourceId] = { ...source, redirectTo: targetId };
    return NextResponse.json({ room: target });
  }

  if (body.action === "migrate") {
    const id = typeof body.room === "string" ? body.room.toUpperCase() : "";
    if (!/^[A-Z0-9]{4,10}$/.test(id)) return NextResponse.json({ error: "That invite code is invalid." }, { status: 400 });
    const members = Array.isArray(body.members)
      ? body.members.filter((member: unknown): member is string => typeof member === "string").map((member: string) => member.trim().slice(0, 32)).filter(Boolean).slice(0, 20)
      : [];
    if (!members.length) return NextResponse.json({ room: rooms[id] ?? null, error: "This invite has no saved members." });
    const now = Date.now();
    const current = canonicalRoom(id, rooms);
    const canonicalId = current?.id ?? id;
    const room: Room = current ?? { id: canonicalId, members: [], createdAt: now, expiresAt: now + 24 * 60 * 60 * 1000 };
    for (const member of members) if (!room.members.some(existing => existing.toLocaleLowerCase() === member.toLocaleLowerCase())) room.members.push(member);
    rooms[canonicalId] = room;
    if (canonicalId !== id) rooms[id] = { ...rooms[id], id, redirectTo: canonicalId, members: room.members };
    writeRooms(rooms);
    return NextResponse.json({ room });
  }

  const id = typeof body.room === "string" ? body.room.toUpperCase() : "";
  const requestedName = typeof body.name === "string" ? body.name.trim().slice(0, 32) : "";
  const room = canonicalRoom(id, rooms);
  if (!room) return NextResponse.json({ error: "This room has expired or does not exist." }, { status: 404 });
  if (body.action !== "join" || !requestedName) return NextResponse.json({ error: "Enter your first name to join." }, { status: 400 });

  let name = requestedName;
  let suffix = 2;
  while (room.members.some(member => member.toLocaleLowerCase() === name.toLocaleLowerCase())) name = `${requestedName} ${suffix++}`;
  room.members.push(name);
  rooms[room.id] = room;
  return NextResponse.json({ room, name });
  });
}
