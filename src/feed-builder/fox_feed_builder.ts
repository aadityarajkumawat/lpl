import { ChromaClient, OpenAIEmbeddingFunction } from 'chromadb'

const chromaClient = new ChromaClient()
const embedder = new OpenAIEmbeddingFunction(process.env.OPENAI_API_KEY)

const FOX_COLLECTION = 'fox_news'

export async function foxFeedBuilder() {
    const collection = await chromaClient.getCollection(
        FOX_COLLECTION,
        embedder,
    )

    const interests = `Schools,Children,Sex,Rights`

    const articles = await collection.query(undefined, 10, undefined, interests)

    console.log('articles', articles)
}
