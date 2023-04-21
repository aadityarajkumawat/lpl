import { ChromaClient, Collection, OpenAIEmbeddingFunction } from 'chromadb'
import { config } from 'dotenv'
import { CollectionsM } from './types'

config()

const chromaClient = new ChromaClient()

const embedder = new OpenAIEmbeddingFunction(process.env.OPENAI_API_KEY)

const NEWS_COLLECTION = 'news-collection'

const genId = () => {
    return (
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
    )
}

let collection: Collection | null = null

export async function initChroma(reset?: boolean) {
    if (reset) await chromaClient.reset()
    const collections: CollectionsM = await chromaClient.listCollections()

    const collectionNames = collections.map((c) => c.name)

    if (!collectionNames.includes(NEWS_COLLECTION)) {
        collection = await chromaClient.createCollection(
            NEWS_COLLECTION,
            embedder,
        )
    } else {
        collection = await chromaClient.getCollection(NEWS_COLLECTION, embedder)
    }
}

export async function alreadyExists(query: string) {
    if (!collection) return
    const doc = await collection.query(undefined, 1, undefined, query)
}

export async function addArticles(
    articles: Array<{
        metaData: Record<string, string | number>
        content: string
    }>,
) {
    if (!collection) return

    const generatedIds = articles.map(() => genId())
    const metaDataArray = articles.map((a) => a.metaData)
    const contentArray = articles.map((a) => a.content)

    await collection.add(generatedIds, undefined, metaDataArray, contentArray)
}

export async function getArticle(query: string) {
    if (!collection) return

    const results = await collection.query(undefined, 1, undefined, query)
    return results
}
