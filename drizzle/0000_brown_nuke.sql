CREATE TABLE `hidden` (
	`room` text NOT NULL,
	`word` text NOT NULL,
	PRIMARY KEY(`room`, `word`)
);
--> statement-breakpoint
CREATE TABLE `responses` (
	`room` text NOT NULL,
	`participant` text NOT NULL,
	`words` text NOT NULL,
	`created` text NOT NULL,
	PRIMARY KEY(`room`, `participant`)
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`secret` text NOT NULL,
	`open` integer DEFAULT 1 NOT NULL,
	`created` text NOT NULL
);
