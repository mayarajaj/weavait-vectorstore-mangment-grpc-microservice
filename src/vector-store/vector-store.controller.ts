import { Controller, Inject, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { VectorStoreService } from './vector-store.service';
import { v4 as uuidv4 } from "uuid";

@Controller()
export class VectorStoreController {
    private readonly logger = new Logger(VectorStoreController.name);

    constructor(private readonly vectorStoreService: VectorStoreService) {}
    @GrpcMethod('VectorStoreService', 'CreateVectorStore')
    async createVectorStore( request: { 
        indexName: string, 
        textKey: string, 
        metadataKeys: string[]

        , 
    
        }): Promise<{ message: string }> {
        try {
            

            return await this.vectorStoreService.createVectorStore(
                request.indexName,
                request.textKey,
                request.metadataKeys,
                
                
            );
        } catch (error) {
            throw new Error(`Error in gRPC create a vector store: ${error.message}`);
        }
    }
    
    


    @GrpcMethod('VectorStoreService', 'AddDocuments')
    async addDocuments(request: { 
        indexName: string, 
        textKey: string, 
        metadataKeys: string[], 
        documents: { pageContent: string, metadata: Record<string, string> }[] 
    }): Promise<{ message: string }> {
        try {
            const documents = request.documents.map((doc) => ({
                pageContent: doc.pageContent,
                metadata: {
                    ...doc.metadata,
                    uuid:  `${uuidv4()}`
                }
            

            }));

            return await this.vectorStoreService.createVectorStoreAndAddDocuments(
                request.indexName,
                request.textKey,
                request.metadataKeys,
                documents
            );
        } catch (error) {
            throw new Error(`Error in gRPC AddDocuments: ${error.message}`);
        }
    }
    @GrpcMethod('VectorStoreService', 'SearchDocumentsWithFilter')
async searchDocumentsWithFilter(request : {
    query: string ,
    k : number ,
    filterKey: string ,
    filterValue: string ,
    indexName : string , 
    textKey : string ,
    metadataKeys : string[]  ,
}): Promise<{ documents: { pageContent: string; metadata: Record<string, any> }[] }>{
    
    const docs = await this.vectorStoreService.searchDocumentsWithFilter(request.query, request.k, request.filterKey, request.filterValue , request.indexName , request.textKey , request.metadataKeys);
    return { documents: docs };
}
    @GrpcMethod('VectorStoreService', 'SearchDocuments')
    async searchDocuments(request : {
        query: string ,
        k : number ,
        filterKey: string ,
        filterValue: string ,
        indexName : string , 
        textKey : string ,
        metadataKeys : string[]  ,
    }): Promise<{ documents: { pageContent: string; metadata: Record<string, any> }[] }>{
        
        const docs = await this.vectorStoreService.searchDocuments(request.query, request.k,  request.indexName , request.textKey , request.metadataKeys);
        return { documents: docs };
    }

    @GrpcMethod('VectorStoreService', 'DeleteDocument')
        async deleteDocument(
        request: {indexName : string , textKey : string , metadataKeys: string[] ,  id: string }
        ): Promise<{ message: string }> {
        
        
        return this.vectorStoreService.deleteDocument(request.indexName , request.textKey , request.metadataKeys , request.id);
    }


}
