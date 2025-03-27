import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'vectorstore',
      protoPath: 'G:\\NEST_projects\\weavaite-microservice-2\\src\\proto\\vector_store.proto',
      url: '0.0.0.0:50051',
    
    },
  });

  await app.listen();
  console.log('gRPC Vector Store Microservice is running...');
}
bootstrap();
