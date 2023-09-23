import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { BaseResponse } from 'src/global/base/base-response';
import { GlobalResponseCode } from 'src/global/base/global-respose-code';
import { ExtractPayload } from 'src/global/decorator/extract-payload.decorator';
import { RecordService } from './record.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RecordDto } from './dto/record.dto';
import { postRecordResponse } from './dto/post-record-response.dto';
import { RecordLIstResponse } from './dto/record-list-response.dto';

@Controller('api/records')
@UseGuards(JwtAuthGuard)
@ApiTags('records')
@ApiBearerAuth()
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Get('friends')
  async getFriendsRecords(
    @ExtractPayload() userId: number,
    @Body('friendId') friendId?: number,
    @Query('last') last?: number,
  ): Promise<BaseResponse<RecordLIstResponse[]>> {
    return new BaseResponse<RecordLIstResponse[]>(
      await this.recordService.getFriendsRecords(userId, friendId, last),
      GlobalResponseCode.OK,
    );
  }

  @Post(':recordId/images')
  @UseInterceptors(FilesInterceptor('images', 5))
  async postRecordImages() {
    return this.recordService.postRecordImages();
  }

  @Post()
  async postRecord(
    @ExtractPayload() userId: number,
    @Body() record: RecordDto,
  ): Promise<BaseResponse<postRecordResponse>> {
    return new BaseResponse<postRecordResponse>(
      await this.recordService.postRecord(userId, record),
      GlobalResponseCode.CREATED,
    );
  }

  @Put(':recordId')
  async putRecord() {
    return this.recordService.putRecord();
  }

  @Delete(':recordId/images')
  async deleteRecordImages() {
    return this.recordService.deleteRecordImages();
  }

  @Patch('comment/:commentId')
  async patchComment() {
    return this.recordService.patchComment();
  }
}
