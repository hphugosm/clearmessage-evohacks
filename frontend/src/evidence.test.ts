import { describe, expect, it } from 'vitest';
import { evidenceExcerpt } from './evidence';
import { parseResponse } from './api';
import type { AnalyzeResponse } from './api';
const observed={key:'request_for_secret',basis:'observed_text_signal'} as const;
const response={status:'suspicious',analysis_complete:false,headline_key:'suspicious_signals',evidence:[observed],action_keys:['verify_independently'],limitations:['language_not_evaluated','not_a_safety_confirmation'],message_language:'en',model_version:'test-only-model',policy_version:'analysis-policy-2',contract_version:'1.1.0',share_summary_keys:['analysis_not_completed','help_verify_independently']};
describe('original-text evidence',()=>{
  it('slices exact Unicode code-point offsets after a surrogate pair',()=>expect(evidenceExcerpt({...observed,span:{start:2,end:18}},'😀 send my password.')).toBe('send my password'));
  it('never derives an excerpt from model evidence or missing offsets',()=>{expect(evidenceExcerpt(observed,'send my password')).toBeNull();expect(evidenceExcerpt({key:'model_signal',basis:'classifier',span:{start:0,end:3}},'send my password')).toBeNull();});
  it.each([{start:-1,end:2},{start:0,end:100},{start:2,end:2},{start:2.5,end:4}])('declines invalid offsets',span=>expect(evidenceExcerpt({...observed,span},'short')).toBeNull());
  it('accepts backward-compatible missing and optional spans',()=>{expect(parseResponse(response)).toEqual(response);const extended={...response,evidence:[{...observed,span:{start:0,end:4}}]};expect(parseResponse(extended)).toEqual(extended);});
  it.each([null,{start:0,end:2001},{start:3,end:2},{start:'0',end:4},{start:0,end:4,excerpt:'PRIVATE_CANARY'}])('rejects corrupt extended payloads except absent null',span=>{
    const input={...response,evidence:[{...observed,span}]};if(span===null)expect(parseResponse(input)).toEqual(input);else expect(()=>parseResponse(input)).toThrow('unavailable');
  });
  it('rejects invented model attribution',()=>expect(()=>parseResponse({...response,evidence:[{key:'model_signal',basis:'classifier',span:{start:0,end:4}}]})).toThrow('unavailable'));
});
