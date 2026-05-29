CREATE TYPE "public"."adulto_mayor_estado" AS ENUM('ACTIVO', 'PENDIENTE', 'INACTIVO', 'FALLECIDO');--> statement-breakpoint
CREATE TABLE "adultos_mayores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"apellido" varchar(100) NOT NULL,
	"dni" varchar(20) NOT NULL,
	"fecha_nacimiento" date NOT NULL,
	"telefono" varchar(50),
	"direccion" varchar(255) NOT NULL,
	"barrio" varchar(100) NOT NULL,
	"observaciones" text,
	"estado" "adulto_mayor_estado" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "adultos_mayores" ADD CONSTRAINT "adultos_mayores_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "adultos_mayores_dni_unique_idx" ON "adultos_mayores" USING btree ("dni");--> statement-breakpoint
CREATE INDEX "adultos_mayores_apellido_idx" ON "adultos_mayores" USING btree ("apellido");--> statement-breakpoint
CREATE INDEX "adultos_mayores_estado_idx" ON "adultos_mayores" USING btree ("estado");