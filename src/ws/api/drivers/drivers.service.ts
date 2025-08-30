import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponse } from '@src/models/api.model';
import { Repository } from 'typeorm';
import { Auth } from '../auth/entities/auth.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Driver } from './entities/driver.entity';

@Injectable()
export class DriversService {
  constructor (
    @InjectRepository(Auth)
    private readonly authRepo: Repository<Auth>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Driver)
    private readonly driverRepo: Repository<Driver>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ){ }

  async create(createDriverDto: CreateDriverDto) {
    try {
      const role = await this.roleRepo.findOne({ where : { name : "driver" } })
      if (role) {
        const added = await this.authRepo.create({
          user : createDriverDto,
          driver : createDriverDto,
          role : role,
          ...createDriverDto,
        })
        this.authRepo.save(added);
        return ApiResponse.serviceResponse({
          status_code : HttpStatus.CREATED,
          code : "CREATED",
        })
      }
      return ApiResponse.serviceResponse({
        status_code : HttpStatus.UNRECOVERABLE_ERROR,
        code : "UNDEFINED",
      })

    } catch (error) {

      return ApiResponse.serviceResponse({
        status_code : HttpStatus.CREATED,
        error : error,
        logout : false,
        redirect : false,

      })
    }

    
    
    
  }

  findAll() {
    return `This action returns all drivers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} driver`;
  }

  update(id: number, updateDriverDto: UpdateDriverDto) {
    return `This action updates a #${id} driver`;
  }

  remove(id: number) {
    return `This action removes a #${id} driver`;
  }
}
