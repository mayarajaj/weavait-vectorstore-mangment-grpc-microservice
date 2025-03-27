import { Injectable, Logger } from '@nestjs/common';
import { WeaviateStore } from '@langchain/weaviate';
import { OpenAIEmbeddings } from '@langchain/openai';
import weaviate, { ApiKey } from 'weaviate-ts-client';
import type { Document } from "@langchain/core/documents";
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from "uuid";
import { Message } from '@nestjs/microservices/external/kafka.interface';

@Injectable()
export class VectorStoreService {
    private readonly logger = new Logger(VectorStoreService.name);
    private embeddings: OpenAIEmbeddings;
    private weaviateClient: any;


    constructor(private readonly configService: ConfigService) {
        try {
            this.logger.log('Initializing OpenAI Embeddings...');
            this.embeddings = new OpenAIEmbeddings({
                model: 'text-embedding-3-large',
                apiKey: this.configService.get<string>('OPENAI_API_KEY'),
            });
            this.logger.log('OpenAI Embeddings initialized successfully.');

            this.logger.log('Connecting to Weaviate client...');
            this.weaviateClient = (weaviate as any).client({
                scheme: this.configService.get<string>('WEAVIATE_SCHEME', 'http'),
                host: this.configService.get<string>('WEAVIATE_HOST', 'localhost'),
                apiKey: new ApiKey(this.configService.get<string>('WEAVIATE_API_KEY', 'default')),
            });
            this.logger.log('Weaviate client connected successfully.');

        } catch (error) {
            this.logger.error('Error while initializing Embeddings or Weaviate', error.stack);
            throw new Error(`Initialization failed: ${error.message}`);
        }
    }
    async createVectorStore(indexName: string, textKey: string, metadataKeys: string[] ): Promise<{message : string}> {
        try {
            this.logger.log(`Creating vector store with indexName=${indexName}, textKey=${textKey}, metadataKeys=${metadataKeys.join(",")}`);

            const vectorStore = new WeaviateStore(this.embeddings, {
                client: this.weaviateClient,
                indexName: indexName,
                textKey: textKey,
                metadataKeys: metadataKeys,
            });
            this.weaviateClient
            //await vectorStore.addDocuments(documents);

            this.logger.log(`Vector store [${indexName}] created and documents added successfully.`);
            return {message : `Vector store [${indexName}] created and documents added successfully.`} ;
        } catch (error) {
            this.logger.error('Error while creating vector store', error.stack);
            throw new Error(`Failed to create vector store: ${error.message}`);
        }
    }


    async createVectorStoreAndAddDocuments(indexName: string, textKey: string, metadataKeys: string[] , documents: Document[]): Promise<{message : string}> {
        try {
            this.logger.log(`Creating vector store with indexName=${indexName}, textKey=${textKey}, metadataKeys=${metadataKeys.join(",")}`);

            const vectorStore = new WeaviateStore(this.embeddings, {
                client: this.weaviateClient,
                indexName: indexName,
                textKey: textKey,
                metadataKeys: metadataKeys, 
            
            });
            await vectorStore.addDocuments(documents);
            this.logger.log(`Vector store [${indexName}] created and documents added successfully.`);
            return {message : `Vector store [${indexName}] created and documents added successfully.`} ;
        } catch (error) {
            this.logger.error('Error while creating vector store', error.stack);
            throw new Error(`Failed to create vector store: ${error.message}`);
        }
    }

    

    async searchDocumentsWithFilter(
        query: string, k: number, filterKey: string, filterValue: string , indexName : string , textKey : string, metadataKeys: string[] 
    ): Promise<Document[]> {
        try {
            const vectorStore = new WeaviateStore(this.embeddings, {
                client: this.weaviateClient,
                indexName: indexName ,
                textKey: textKey,
                metadataKeys: metadataKeys ,
            });
    
            const filter = {
                where: {
                    operator: "Equal" as const,
                    path: [filterKey],
                    valueText: filterValue,
                },
            };
    
            const results = await vectorStore.similaritySearch(query, k, filter);
            this.logger.log(`Found ${results.length} documents`);
    
            return results.map(doc => ({
                pageContent: doc.pageContent,
                metadata: doc.metadata,
            }));
        } catch (error) {
            this.logger.error('Error while searching documents', error.stack);
            throw new Error(`Failed to search documents: ${error.message}`);
        }
    }

    async searchDocuments(
        query: string, k: number,  indexName : string , textKey : string, metadataKeys: string[] 
    ): Promise<Document[]> {
        try {
            const vectorStore = new WeaviateStore(this.embeddings, {
                client: this.weaviateClient,
                indexName: indexName ,
                textKey: textKey,
                metadataKeys: metadataKeys ,
            });
    
            
            const results = await vectorStore.similaritySearch(query, k);
            this.logger.log(`Found ${results.length} documents`);
    
            return results.map(doc => ({
                pageContent: doc.pageContent,
                metadata: doc.metadata,
            }));
        } catch (error) {
            this.logger.error('Error while searching documents', error.stack);
            throw new Error(`Failed to search documents: ${error.message}`);
        }
    }

    async deleteDocument(
        indexName : string , textKey : string, metadataKeys: string[] , id : string 
    ): Promise<{message : string}> {
        try {
            const vectorStore = new WeaviateStore(this.embeddings, {
                client: this.weaviateClient,
                indexName: indexName ,
                textKey: textKey,
                metadataKeys: metadataKeys ,
            });
            const filter = {
                where: {
                    operator: "Equal" as const,
                    path: 'uuid',
                    valueText: id,
                },
            };
            
            
                await vectorStore.delete({
                    ids: [id]
                });
        
                this.logger.log(`Document with id ${id} deleted successfully.`);
                return { message: `Document with id ${id} deleted successfully.` };
            }
            
         catch (error) {
            this.logger.error('Error while searching documents', error.stack);
            throw new Error(`Failed to search documents: ${error.message}`);
        }

    }
    
    


}
