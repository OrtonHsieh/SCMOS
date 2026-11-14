"""Validate and export weekly study JSON without original source artifacts."""
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parent.parent

def prepare():
    inputs=sorted((ROOT/'output').glob('week*/content.json'))
    if not inputs: raise ValueError('No local weekly content.json files found')
    exports=[];records=[];seen=set()
    for path in inputs:
        data=json.loads(path.read_text());week=data['week']
        if not isinstance(week,int) or week<1: raise ValueError('Invalid week')
        concepts={x['concept_id'] for x in data['concepts']}
        folder=ROOT/f'materials/week{week:02}/derived'
        segments={x['id'] for x in json.loads((folder/'transcript-segments.json').read_text())}
        for x in data['concepts']+data['questions']:
            assert x['sources'], 'Missing sources'
            for ref in x['sources']:
                if ref['source_id']==f'w{week:02}-transcript':
                    assert ref['locator'] in segments, ref
                else:
                    assert ref['source_id']==f'w{week:02}-notes', ref
                    assert re.fullmatch(r'PDF p\.[1-9]\d*',ref['locator']),ref
                    page=int(ref['locator'].split('.')[-1])
                    assert (folder/f'notes-page-{page}.png').is_file(),ref
        for q in data['questions']:
            assert q['question_id'] not in seen,'Duplicate question ID'
            seen.add(q['question_id']);assert set(q['concept_ids'])<=concepts
            if q['type']=='choice':
                assert 0<=q['answer']<len(q['options'])
                assert len(q['options'])==len(q['explanations'])
            elif q['type']=='numeric':assert q['tolerance']>=0 and q['unit']
            elif q['type']=='self':assert q['rubric']
            else:raise ValueError('Unsupported type')
        text=json.dumps(data,ensure_ascii=False,indent=2)+'\n'
        assert not any(s in text for s in ('/Users/','file://','original_path','../../materials/')),'Private path in export'
        name=f'week{week:02}.json';exports.append((name,text));records.append(dict(week=week,title=data['title'],chapter_ids=data['chapter_ids'],file=name,concepts=len(data['concepts']),questions=len(data['questions'])))
    assert len({x['week'] for x in records})==len(records),'Duplicate week'
    dest=ROOT/'docs/data';dest.mkdir(parents=True,exist_ok=True)
    for name,text in exports:(dest/name).write_text(text)
    (dest/'catalog.json').write_text(json.dumps(dict(schema_version=1,total_weeks=16,weeks=records),ensure_ascii=False,indent=2)+'\n')
    (ROOT/'docs/.nojekyll').touch()
    print(f'Validated and exported {len(records)} weeks, {len(seen)} questions')

if __name__=='__main__':prepare()
