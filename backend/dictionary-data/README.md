# 本地词典数据目录

## 说明

该目录用于存放开发者自行准备的、**具有合法授权**的词典数据文件。

## 重要提示

⚠️ **版权声明**
- 本仓库**不会附带任何真实词典内容**
- 开发者需要自行准备具有合法使用权的词典数据
- 请确保你使用的词典数据符合相关版权法律法规

## 数据格式

推荐使用以下格式之一:

### TSV 格式
```
spelling	phonetic_uk	phonetic_us	part_of_speech	definition_en	definition_zh	example_en	example_zh
apple	/ˈæpl/	/ˈæpl/	noun	A round fruit with red or green skin	苹果	I eat an apple every day	我每天吃一个苹果
```

### JSON 格式
```json
[
  {
    "spelling": "apple",
    "phonetic_uk": "/ˈæpl/",
    "phonetic_us": "/ˈæpl/",
    "senses": [
      {
        "part_of_speech": "noun",
        "definition_en": "A round fruit with red or green skin",
        "definition_zh": "苹果",
        "examples": [
          {
            "sentence_en": "I eat an apple every day",
            "sentence_zh": "我每天吃一个苹果"
          }
        ]
      }
    ]
  }
]
```

## 导入方法

将来可以通过导入脚本把本地词典数据写入数据库:

```bash
# 设置词典文件路径环境变量
export DICTIONARY_TSV_PATH=/path/to/your/dictionary.tsv

# 运行导入脚本
cd backend
npx ts-node scripts/import_local_dictionary.ts
```

## 推荐词典数据源

以下是一些可能的合法词典数据来源(请自行确认使用权限):

1. **开源词典项目**
   - WordNet (Princeton University)
   - OPTED (Open English WordNet)

2. **自建词典**
   - 从公开资源整理
   - 购买商业词典授权

3. **教育机构提供的数据集**
   - 部分大学提供的研究用词典数据

## 注意事项

- 导入前请备份数据库
- 大型词典文件可能需要较长导入时间
- 导入过程中请勿中断程序
