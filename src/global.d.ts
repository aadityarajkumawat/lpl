declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'development' | 'production' | 'test'
        OPENAI_API_KEY: string
        MONGO_URI: string
    }
}
