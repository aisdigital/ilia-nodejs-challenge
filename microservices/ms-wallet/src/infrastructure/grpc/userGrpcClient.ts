import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import jwt from 'jsonwebtoken';

const PROTO_PATH = process.env.PROTO_PATH || path.join(__dirname, '../../../../proto/users.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const usersProto = grpc.loadPackageDefinition(packageDefinition).users as any;

class UserGrpcClient {
    private client: any;

    constructor() {
        const userServiceHost = process.env.USER_SERVICE_HOST || 'user-app';
        const userServicePort = process.env.USER_GRPC_PORT || '50051';

        this.client = new usersProto.UserService(
            `${userServiceHost}:${userServicePort}`,
            grpc.credentials.createInsecure()
        );
    }

    async validateUser(userId: string): Promise<{ valid: boolean; user?: any; error?: string }> {
        return new Promise((resolve, reject) => {
            const secret = process.env.JWT_INTERNAL_SECRET || 'ILIACHALLENGE_INTERNAL';
            const token = jwt.sign({}, secret, { expiresIn: '1m' });

            this.client.ValidateUser(
                { user_id: userId, internal_token: token },
                (error: any, response: any) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(response);
                }
            );
        });
    }
}

export const userGrpcClient = new UserGrpcClient();
