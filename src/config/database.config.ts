import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";

export const DatabaseConfig = MongooseModule.forRootAsync({

    imports:[ConfigModule],
    useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_ATLAS_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }),

    inject: [ConfigService],

});