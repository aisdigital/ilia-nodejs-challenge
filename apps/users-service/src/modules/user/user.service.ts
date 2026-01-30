import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  Optional,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UserService implements OnModuleInit {
  private walletService: any;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Optional()
    @Inject('WALLET_PACKAGE')
    private readonly walletClient: ClientGrpc | null,
  ) {}

  onModuleInit() {
    if (this.walletClient) {
      this.walletService = this.walletClient.getService('WalletService');
    }
  }

  async create(data: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
    const saved = await this.userRepository.save(user);
    if (this.walletService) {
      try {
        await firstValueFrom(this.walletService.createWallet({ user_id: saved.id }));
      } catch (err: any) {
        console.warn('Wallet creation for user failed:', err?.message || err);
      }
    }
    return saved;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const updateData = { ...data };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
    }
    await this.userRepository.update({ id }, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete({ id });
  }
}
