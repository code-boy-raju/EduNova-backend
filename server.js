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
const path=require('path');

// ✅ UPDATED CORS configuration for production
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://edunova-one.vercel.app', // ⚠️ REPLACE with your actual Vercel URL
    'https://*.vercel.app',
    process.env.FRONTEND_URL // Allow all Vercel preview deployments
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 600 // Cache preflight requests for 10 minutes
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options(/.*/, cors(corsOptions));


// middlewares
app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ extended: true, limit: '1gb' }));
// Serve static files from 'uploads' and 'videos' directories
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));

connectDB()

// Health check endpoint (important for Render)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});
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