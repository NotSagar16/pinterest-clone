const mongoose =require('mongoose');
mongoose.connect('mongodb://localhost:27017/pinterest');
const postSchema = mongoose.Schema({
    postText:{
        type:String,
        required:true,
    },
    image:{
        type:String
    },
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref:'Users',
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    likes:{
        type:Number,
        default:0,
    },
});

module.exports = mongoose.model("Posts",postSchema);