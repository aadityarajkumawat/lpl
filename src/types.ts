export type CollectionM = {
    name: string
    metadata: { api_key: string; org_id: string; model: string }
}
export type CollectionsM = Array<CollectionM>

export type ArticleDoc = {
    metaData: {
        headline: string
        date: string
        link: string
        image: string
        source: string
    }
    content: string
}
