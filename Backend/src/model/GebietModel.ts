import { model, Schema, Types, Document } from "mongoose"

export interface IGebiet extends Document {
    name: string,
    beschreibung?: string,
    public: boolean,
    closed: boolean,
    readonly createdAt: Date,
    verwalter: Types.ObjectId
}

const gebietSchema = new Schema<IGebiet>({
    name: { type: String, required: true, unique: true },
    beschreibung: { type: String },
    public: { type: Boolean, default: false },
    closed: { type: Boolean, default: false },
    verwalter: { type: Schema.Types.ObjectId, ref: 'Prof', required: true }
},
    { timestamps: true })

export const Gebiet = model<IGebiet>("Gebiet", gebietSchema);