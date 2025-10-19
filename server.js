const express=require("express")
require("dotenv").config()
const authrouter=require("./routers/authRoute.js")
const courserouter=require("./routers/courseRoutes.js")
const lessonRouter=require("./routers/leesonRoute.js")
const quizRouter=require("./routers/quizRoutes.js")
const resultRouter=require("./routers/resultRoute.js")
const app=express()
const connectDB=require("./config/db.js")
const cors=require("cors")

// ✅ CORS configuration
const corsOptions = {
  origin: [
    'https://edunova-one.vercel.app', process.env.FRONTEND_URL// your React frontend URL (Vite default)
   // optional: if you're using CRA
    // You can also add your production domain here later
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true, // if you're using cookies or auth headers
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Optional: handle preflight requests
// app.options('/*', cors(corsOptions));

// middlewares
app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ extended: true, limit: '1gb' }));
connectDB()
//  routings
app.use("/user",authrouter)
app.use("/course",courserouter)
app.use("/lesson",lessonRouter)
app.use("/quiz",quizRouter)
app.use('/result',resultRouter)

app.listen(process.env.PORT,()=>{
    console.log(`server running on ${ process.env.PORT}`);  
})