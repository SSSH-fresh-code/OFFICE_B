import { ExceptionEnum } from "src/infrastructure/filter/exception/exception.enum";
import { Topic } from "./topic.entity";
import { iTopic } from "./topic.interface";
import { Topic as PrismaTopic } from "@prisma/client";
import { formatMessage } from "src/infrastructure/util/message.util";

describe('Topic Entity', () => {
  let topic: iTopic;

  beforeEach(() => {
    topic = null;
  });


  describe('생성자', () => {
    it('생성자 사용하여 객체 생성', () => {
      const id = 1;
      const name = '주제';

      topic = new Topic(id, name);

      expect(topic.id).toEqual(id);
      expect(topic.name).toEqual(name);
    });
  });

  describe('get id()', () => {
    it('아이디 조회', () => {
      const id = 1;

      topic = new Topic(id, "name");

      expect(topic.id).toEqual(1);
    });
  });

  describe('get name()', () => {
    it('이름 조회', () => {
      const name = "name";

      topic = new Topic(1, name);

      expect(topic.name).toEqual(name);
    });
  });

  describe('set name()', () => {
    it('이름 설정', () => {
      const name = "새로운 주제";
      const convertName = name.replaceAll(" ", "_");

      topic = new Topic(1, "name");

      topic.name = name;

      expect(topic.name).toEqual(convertName);
    });

    it('50자 이상으로 이름 설정', () => {
      let text = "";
      while (text.length < 52) { text += "d" }

      topic = new Topic(1, "name");

      expect(() => {
        topic.name = text;
      }).toThrow(formatMessage(ExceptionEnum.INVALID_PARAMETER, { param: "name" }));
    });
  });

  describe('get createdAt()', () => {
    it('생성일자 조회', () => {
      const date = new Date();

      topic = new Topic(1, "name", date);

      expect(topic.createdAt).toEqual(date);
    });
  });

  describe('get updatedAt()', () => {
    it('수정일자 조회', () => {
      const date = new Date();

      topic = new Topic(1, "name", date, date);

      expect(topic.updatedAt).toEqual(date);

    });
  });

  describe('of', () => {
    it('정적 생성자 사용', () => {
      const prismaTopic: PrismaTopic = {
        id: 1,
        name: "name",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      topic = new Topic(prismaTopic.id, prismaTopic.name, prismaTopic.createdAt, prismaTopic.updatedAt);
      const ofTopic = Topic.of(prismaTopic);

      expect(topic).toEqual(ofTopic);
    })
  });

  describe('toDto', () => {
    it('ReadTopicDto 로 변환', () => {
      const date = new Date();
      topic = new Topic(1, "name", date, date);

      const dto = topic.toDto();

      expect(topic.id).toEqual(dto.id);
      expect(topic.name).toEqual(dto.name);
      expect(topic.createdAt).toEqual(dto.createdAt);
      expect(topic.updatedAt).toEqual(dto.updatedAt);
    });
  });

});
