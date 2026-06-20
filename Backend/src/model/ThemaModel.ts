import { model, Schema, Types } from "mongoose"

export interface IThema extends Document {
    titel: string,
    beschreibung: string,
    literatur?: string,
    abschluss: "bsc" | "msc" | "any",
    status: "offen" | "reserviert",
    readonly updatedAt?: Date,
    betreuer: Types.ObjectId,
    gebiet: Types.ObjectId,

}

const themaSchema = new Schema<IThema>({
    titel: { type: String, required: true },
    beschreibung: { type: String, required: true },
    literatur: { type: String },
    abschluss: { type: String, enum: ["bsc", "msc", "any"], default: "any" },
    status: { type: String, enum: ["offen", "reserviert"], default: "offen" },
    betreuer: { type: Schema.Types.ObjectId, ref: 'Prof', required: true },
    gebiet: { type: Schema.Types.ObjectId, ref: 'Gebiet', required: true }
},
    { timestamps: true })

export const Thema = model<IThema>("Thema", themaSchema);