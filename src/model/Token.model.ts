import mongoose , {Schema , Document, Types} from "mongoose";

export interface IToken extends Document {
    token: string
    user: Types.ObjectId
    date: Date
}

const TokenSchema : Schema = new Schema({
    token: {
        type: String,
        require: true
    },
    user: {
        type: Types.ObjectId,
        ref: 'User'
    },
    createAt: {
        type: Date,
        default: Date.now(),
        expires: '10m'
    }
})

const Token = mongoose.model<IToken>('Token', TokenSchema)
export default Token 