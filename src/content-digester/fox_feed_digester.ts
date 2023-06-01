import { ChromaClient, OpenAIEmbeddingFunction } from 'chromadb'
import { v4 } from 'uuid'
import { client } from '../db'

const chromaClient = new ChromaClient()
const embedder = new OpenAIEmbeddingFunction(process.env.OPENAI_API_KEY)

const genId = () => v4()

const FOX_COLLECTION = 'fox_news'

export async function digestFoxNews() {
    const collections: Array<{ name: string }> =
        await chromaClient.listCollections()

    const collectionNames = collections.map((c) => c.name)

    if (!collectionNames.includes(FOX_COLLECTION)) {
        await chromaClient.createCollection(FOX_COLLECTION, embedder)
    }

    const collection = await chromaClient.getCollection(
        FOX_COLLECTION,
        embedder,
    )

    const newsArticles = await client
        .db('news_directory')
        .collection('news_v1')
        .find({ content: { $ne: '' }, link: { $ne: '' }, source: 'fox_news' })
        .limit(100)
        .toArray()

    const ids = newsArticles.map(() => genId())
    const meta = newsArticles.map((article) => ({
        headline: article.headline,
        date: article.date,
        source: article.source,
    }))
    const content = newsArticles.map((article) => article.content)

    console.log('Adding...')
    await collection.add(ids, undefined, meta, content)
    console.log('Added')
}
