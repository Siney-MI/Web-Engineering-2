import { Model, model, Schema, Document } from "mongoose"
import bcrypt from "bcryptjs";


export interface IProf extends Document {
    name: string,
    titel?: string,
    campusID: string,
    password: string,
    admin: boolean
}

export interface IProfMethods {
    isCorrectPassword(plainPassword: string): Promise<boolean>;
}
export type ProfModel = Model<IProf, {}, IProfMethods>

const profSchema = new Schema<IProf, ProfModel, IProfMethods>({
    name: { type: String, required: true },
    titel: { type: String },
    campusID: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    admin: { type: Boolean, default: false }

})

profSchema.pre("save", async function () {
    if (this.isModified("password")) {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword
    }
})

profSchema.pre("updateOne", async function () {
    const update = this.getUpdate();
    if (update && 'password' in update) {
        const hashedPassword = await bcrypt.hash(update.password, 10);
        update.password = hashedPassword;
    }
})


profSchema.method("isCorrectPassword",
    async function (candidatePassword: string): Promise<boolean> {
        if (!this.password.startsWith("$2")) {
            throw new Error("Password muss gehashed sein.");
        }
        return bcrypt.compare(candidatePassword, this.password);
    })

export const Prof = model<IProf, ProfModel>("Prof", profSchema);