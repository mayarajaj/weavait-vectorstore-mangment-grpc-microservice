import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VectorStoreService } from './vector-store/vector-store.service';
import { VectorStoreController } from './vector-store/vector-store.controller';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // <-- this makes ConfigService available globally
    }),
  ],
  controllers: [AppController, VectorStoreController],
  providers: [AppService, VectorStoreService],
})
export class AppModule {}
