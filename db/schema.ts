import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
export const rooms = sqliteTable('rooms', { id:text('id').primaryKey(), title:text('title').notNull(), secret:text('secret').notNull(), open:integer('open').notNull().default(1), generation:integer('generation').notNull().default(0), created:text('created').notNull() });
export const responses = sqliteTable('responses', { room:text('room').notNull(), participant:text('participant').notNull(), words:text('words').notNull(), created:text('created').notNull() }, t=>[primaryKey({columns:[t.room,t.participant]})]);
export const hidden = sqliteTable('hidden', { room:text('room').notNull(), word:text('word').notNull() }, t=>[primaryKey({columns:[t.room,t.word]})]);
