// used to setup db schema

import { date } from "drizzle-orm/pg-core";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const frequencyEnum = pgEnum("frequency", ["daily", "weekly"]);
export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "done",
]);
export const priorityEnum = pgEnum("priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

// habits
export const habits = pgTable("habits", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  frequency: frequencyEnum("frequency").notNull().default("daily"),
  color: text("color").default("#6366f1"),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// moods
export const moodEntries = pgTable("mood_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  mood: integer("mood").notNull(),
  note: text("note"),
  energyLevel: integer("energy_level"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// tasks
export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default("todo"),
  priority: priorityEnum("priority").notNull().default("medium"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// thoughts
export const thoughts = pgTable("thoughts", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  tags: text("tags").array(),
  isPinned: boolean("is_pinned").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// habit loggs
export const habitLogs = pgTable("habit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  habitId: uuid("habit_id")
    .references(() => habits.id)
    .notNull(),
  date: date("date").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
},
(table) => {
  return {
    uniqueHabitDate: uniqueIndex("habit_date_unique").on(
      table.habitId,
      table.date
    ),
  };
});

// user setting
export const userSettings = pgTable("user_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().default("User"),
  height: integer("height"),
  weight: integer("weight"),
  additionalInfo: text("additional_info"), // for more details
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});