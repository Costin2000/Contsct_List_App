import { EntityRepository, Repository } from 'typeorm';
import { Telephone } from '../models/telephone.models';
import { Injectable } from '@nestjs/common';

@Injectable()
@EntityRepository(Telephone)
export class TelephoneRepository extends Repository<Telephone> {}
