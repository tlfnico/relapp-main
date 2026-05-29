CREATE TYPE "public"."relevamiento_estado" AS ENUM('BORRADOR', 'FINALIZADO');--> statement-breakpoint
CREATE TYPE "public"."relevamiento_riesgo" AS ENUM('BAJO', 'MEDIO', 'ALTO', 'CRITICO');--> statement-breakpoint
CREATE TABLE "relevamientos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"adulto_mayor_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"tipo_vivienda" varchar(100) NOT NULL,
	"tiene_agua" boolean NOT NULL,
	"tiene_luz" boolean NOT NULL,
	"tiene_gas" boolean NOT NULL,
	"hacinamiento" boolean NOT NULL,
	"enfermedades_cronicas" text NOT NULL,
	"nivel_movilidad" varchar(100) NOT NULL,
	"toma_medicamentos" boolean NOT NULL,
	"ingresos" numeric(10, 2) NOT NULL,
	"obra_social" varchar(100) NOT NULL,
	"red_apoyo" varchar(100) NOT NULL,
	"riesgo_social" "relevamiento_riesgo" NOT NULL,
	"estado" "relevamiento_estado" NOT NULL,
	"observaciones_general" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "relevamientos" ADD CONSTRAINT "relevamientos_adulto_mayor_id_adultos_mayores_id_fk" FOREIGN KEY ("adulto_mayor_id") REFERENCES "public"."adultos_mayores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relevamientos" ADD CONSTRAINT "relevamientos_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "relevamientos_adulto_mayor_id_idx" ON "relevamientos" USING btree ("adulto_mayor_id");--> statement-breakpoint
CREATE INDEX "relevamientos_created_by_idx" ON "relevamientos" USING btree ("created_by");