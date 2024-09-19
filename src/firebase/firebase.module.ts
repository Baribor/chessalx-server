import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

const firebaseProvider = {
  provide: 'FIREBASE_APP',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const firebaseConfig: admin.ServiceAccount = {
      projectId: configService.get('FIREBASE_PROJECT_ID'),
      privateKey: configService.get('FIREBASE_PRIVATE_KEY'),
      clientEmail: configService.get('FIREBASE_CLIENT_EMAIL'),
    };
    return admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
      databaseURL:
        'https://chessalx-a3110-default-rtdb.europe-west1.firebasedatabase.app',
    });
  },
};

@Module({
  imports: [ConfigModule],
  providers: [firebaseProvider, FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
