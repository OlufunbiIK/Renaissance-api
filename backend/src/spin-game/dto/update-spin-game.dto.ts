import { PartialType } from '@nestjs/mapped-types';
import { CreateSpinGameDto } from './create-spin-game.dto';

export class UpdateSpinGameDto extends PartialType(CreateSpinGameDto) {}
