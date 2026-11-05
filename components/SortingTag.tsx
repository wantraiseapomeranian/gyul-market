import { Stamp } from './Stamp';

export function SortingTag() {
  return (
    <div className="tag-wrap" role="img" aria-label="선별 태그: 노지 온주밀감, 규격 2S에서 M, 중량 10kg, 선별필">
      <svg className="tag-cord" width="70" height="72" viewBox="0 0 70 72" aria-hidden="true"><path d="M22 72 C 20 46, 34 30, 66 2" /></svg>
      <div className="tag" aria-hidden="true">
        <i className="tag-hole" />
        <p className="tag-org">귤상회 선과장</p>
        <p className="tag-kind">노지 온주밀감</p>
        <dl className="tag-rows">
          <div><dt>규격</dt><dd>2S–M</dd></div>
          <div><dt>중량</dt><dd>10kg</dd></div>
        </dl>
        <Stamp className="tag-stamp">선별<br />필</Stamp>
      </div>
    </div>
  );
}
