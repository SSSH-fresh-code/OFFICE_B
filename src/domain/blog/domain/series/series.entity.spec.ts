import {ExceptionEnum} from 'src/infrastructure/filter/exception/exception.enum';
import {Series as PrismaSeries} from '@prisma/client';
import {formatMessage} from 'src/infrastructure/util/message.util';
import {iSeries} from './series.interface';
import {Series} from './series.entity';
import {Topic} from '../topic/topic.entity';
import {iTopic} from '../topic/topic.interface';

describe('Series Entity', () => {
  let series: iSeries;
  let topic: iTopic;

  beforeEach(() => {
    series = null;
    topic = new Topic(1, 'topic');
  });

  describe('생성자', () => {
    it('생성자 사용하여 객체 생성', () => {
      const id = 1;
      const name = '주제';

      series = new Series(id, name, topic);

      expect(series.id).toEqual(id);
      expect(series.name).toEqual(name);
      expect(series.topic).toEqual(topic);
    });
  });

  describe('get id()', () => {
    it('아이디 조회', () => {
      const id = 1;

      series = new Series(id, 'name', topic);

      expect(series.id).toEqual(1);
    });
  });

  describe('get name()', () => {
    it('이름 조회', () => {
      const name = 'name';

      series = new Series(1, name, topic);

      expect(series.name).toEqual(name);
    });
  });

  describe('set name()', () => {
    it('이름 설정', () => {
      const name = '새로운 시리즈';
      const convertName = name.replaceAll(' ', '_');

      series = new Series(1, 'name', topic);

      series.name = name;

      expect(series.name).toEqual(convertName);
    });

    it('50자 이상으로 이름 설정', () => {
      let text = '';
      while (text.length < 52) {
        text += 'd';
      }

      series = new Series(1, 'name', topic);

      expect(() => {
        series.name = text;
      }).toThrow(
        formatMessage(ExceptionEnum.INVALID_PARAMETER, {param: 'name'}),
      );
    });
  });

  describe('get topic()', () => {
    it('주제 조회', () => {
      series = new Series(1, 'name', topic);

      expect(series.topic).toEqual(topic);
    });
  });

  describe('get createdAt()', () => {
    it('생성일자 조회', () => {
      const date = new Date();

      series = new Series(1, 'name', topic, date);

      expect(series.createdAt).toEqual(date);
    });
  });

  describe('get updatedAt()', () => {
    it('수정일자 조회', () => {
      const date = new Date();

      series = new Series(1, 'name', topic, date, date);

      expect(series.updatedAt).toEqual(date);
    });
  });

  describe('of', () => {
    it('정적 생성자 사용', () => {
      const prismaSeries: PrismaSeries = {
        id: 1,
        name: 'name',
        topicId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      series = new Series(
        prismaSeries.id,
        prismaSeries.name,
        topic,
        prismaSeries.createdAt,
        prismaSeries.updatedAt,
      );
      const ofSeries = Series.of(prismaSeries, topic);

      expect(series).toEqual(ofSeries);
    });
  });

  describe('toDto', () => {
    it('ReadSeriesDto 로 변환', () => {
      const date = new Date();
      series = new Series(1, 'name', topic, date, date);

      const dto = series.toDto();

      expect(series.id).toEqual(dto.id);
      expect(series.name).toEqual(dto.name);
      expect(series.topic.toDto()).toEqual(dto.topic);
      expect(series.createdAt).toEqual(dto.createdAt);
      expect(series.updatedAt).toEqual(dto.updatedAt);
    });
  });
});
