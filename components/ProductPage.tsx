import Image from 'next/image';
import hero from '@/assets/images/hero.jpg';
import story from '@/assets/images/story.jpg';
import { Wordmark } from './Wordmark';
import { SortingTag } from './SortingTag';

const SIZES = '(max-width: 430px) 100vw, 430px';

export function ProductPage() {
  return (
    <main className="has-bar">
      <header className="mainhead"><Wordmark /></header>
      <div className="gallery">
        <Image src={hero} alt="어두운 나무 위에 놓인 잎 달린 귤들과, 껍질을 반쯤 벗겨 과육이 보이는 귤" loading="eager" fetchPriority="high" sizes={SIZES} placeholder="blur" />
        <SortingTag />
      </div>
      <section className="head" aria-label="상품 정보">
        <p className="brand-line">귤상회 선과장</p>
        <h1 className="title" id="product-title" tabIndex={-1}>제주 서귀포 햇귤 10kg</h1>
        <p className="desc">노지 온주밀감 · 2S~M 크기 혼합</p>
        <p className="was"><span className="rate">14%</span><span className="sr-only">할인, 정가 </span><del>35,000원</del></p>
        <p className="price"><strong>29,900</strong><span className="won">원</span><span className="unit">100g당 299원</span></p>
      </section>
      <div className="band" />
      <dl className="info">
        <div><dt>배송</dt><dd>무료배송</dd></div>
        <div><dt>원산지</dt><dd>국내산(제주)</dd></div>
        <div><dt>품종</dt><dd>노지 온주밀감</dd></div>
        <div><dt>규격</dt><dd>10kg · 2S·S·M 혼합</dd></div>
        <div><dt>보관</dt><dd>서늘하고 그늘진 곳</dd></div>
      </dl>
      <section className="story">
        <h2>껍질을 까는 순간,<br />달콤한 제주를 만나보세요.</h2>
        <p>귤상회는 크기별로 골라 담아 보냅니다.</p>
      </section>
      <section className="notes">
        <h2>상품 설명</h2>
        <p>노지 온주밀감은 비닐하우스 없이 바깥 밭에서 햇볕과 바람을 맞으며 자란 귤입니다. 제주 노지감귤은 보통 10월부터 12월 사이에 수확합니다. 수확 시기에 따라 껍질에 초록빛이 남아 있을 수 있으며, 크기와 모양은 조금씩 다를 수 있습니다.</p>
        <h2>크기 안내</h2>
        <p>2S·S·M은 귤의 지름으로 나눈 크기 등급입니다. 이 상품은 세 가지 크기를 섞어 담으며, 크기를 고를 수는 없습니다.</p>
        <h2>보관과 드시는 방법</h2>
        <ul>
          <li>받으신 뒤에는 상자를 열어 서늘하고 그늘진 곳에 보관해 주세요.</li>
          <li>귤끼리 눌리지 않도록 겹치지 않게 펼쳐 두면 좋습니다.</li>
          <li>바닥에 신문지를 깔아 두면 습기를 조절하는 데 도움이 됩니다.</li>
          <li>무르거나 곰팡이가 보이는 귤은 다른 귤로 번지기 전에 바로 골라내 주세요.</li>
          <li>눌린 귤부터 먼저 드시길 권합니다.</li>
        </ul>
      </section>
      <figure className="photo">
        <Image src={story} alt="수확 자루에 담긴 노지감귤" sizes={SIZES} />
        <figcaption>노지감귤 수확</figcaption>
      </figure>
      <div className="band" />
      <section className="notes">
        <h2>배송 안내</h2>
        <ul>
          <li>전 상품 무료배송입니다.</li>
          <li>출고일은 수확과 선별 일정에 따라 달라질 수 있습니다.</li>
          <li>제주에서 출발하는 상품이라 기상 상황에 따라 배송이 늦어질 수 있습니다.</li>
        </ul>
        <h2>교환·환불 안내</h2>
        <ul>
          <li>신선식품 특성상 단순 변심에 의한 교환·환불은 어렵습니다.</li>
          <li>상품 상태에 따라 안내가 달라질 수 있습니다.</li>
          <li>크기·색·모양의 자연스러운 차이는 교환 사유가 되지 않습니다.</li>
        </ul>
      </section>
      <footer className="foot">
        <p>사진: Unsplash · Jonathan Pielmayer, insung yoon, Luis Guaman</p>
      </footer>
    </main>
  );
}
