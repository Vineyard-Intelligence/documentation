# Distribution

`distribution` 블록은 Vineyard 클라이언트에게 플러그인이나 Type Pack의 **번들을 가져올 위치**와 선택적으로 **검증 방법**을 알려줍니다. 하나의 동일한 블록 형태가 두 콘텐츠 유형 모두에서 사용됩니다 — 별도의 플러그인 대 Type Pack 배포 형식은 없습니다.

## 공유 블록

```jsonc
"distribution": {
  "kind": "git",                            // git | zip | inline
  "repository": "https://github.com/owner/repo",
  "ref": "9f1c2ad7...e6f7",                 // 불변: 40자 SHA 또는 주석 태그 (브랜치는 거부됨)
  "path": "manifest.json",                  // repo@ref 내의 파일 (git kind)
  "integrity": { "algo": "sha256", "hash": "..." },          // 선택 사항
  "archive": { "url": "https://....zip", "sha256": "..." }   // 선택 사항 (zip kind)
}
```

전체 필드별 참조는 [registry schema](../reference/registry-schema.md)에 있습니다. 이 블록을 임베드하는 플러그인/Type Pack 스키마는 [plugin manifest](plugin-manifest.md)와 [Type Pack schema](../reference/typepack-schema.md)에 있습니다.

!!! warning "`ref`는 불변이어야 합니다 — 브랜치는 거부됨"
    `main`, `develop` 또는 기타 움직이는 브랜치의 `ref`는 제출 시 `VineyardReviewBot`에 의해 **거부**됩니다. 40자 커밋 SHA 또는 주석 태그로 고정하여 `repo@ref`가 항상 검토된 정확한 바이트로 확인되도록 하세요. 이것이 설치된 `identifier@version`을 재현 가능하게 만드는 요소입니다. *새로운* `ref`가 제공된 업그레이드로 표시되는 방식은 [updates](updates.md)를 참조하세요.

## `kind` 값

=== "git"

    GitHub 저장소의 고정된 트리에서 직접 번들을 가져옵니다. `path`는 `repo@ref` 내의 파일을 선택합니다.

    ```jsonc
    "distribution": {
      "kind": "git",
      "repository": "https://github.com/Vineyard-Intelligence/cidr-expand",
      "ref": "4d2f8b19c0a7e6f3b1d5a4c9e8f70123456789ab",
      "path": "manifest.json",
      "integrity": { "algo": "sha256", "hash": "e3b0c44298fc1c149afbf4c8996fb924..." }
    }
    ```

=== "zip"

    `archive.url`로 지정된 미리 빌드된 아카이브(일반적으로 GitHub 릴리스 자산)를 가져옵니다. 선택적으로 `archive.sha256`을 사용합니다.

    ```jsonc
    "distribution": {
      "kind": "zip",
      "repository": "https://github.com/Vineyard-Intelligence/chaos-pack",
      "ref": "v1.2.0",
      "archive": {
        "url": "https://github.com/Vineyard-Intelligence/chaos-pack/releases/download/v1.2.0/chaos-pack.zip",
        "sha256": "9b74c9897bac770ffc029102a200c5de..."
      }
    }
    ```

=== "inline"

    번들이 매니페스트 자체에 **인라인**으로 제공됩니다 — 6개의 [참조 플러그인](../guide/running-plugins.md)(Korean Roulette, Russian Roulette, Thanos Snap, Black Hole, Dumb AI Optimizer, Schrödinger's Node) 및 기타 작고 완전히 자체 포함된 플러그인에서 사용됩니다. 외부 가져오기가 필요하지 않습니다.

    ```jsonc
    "distribution": {
      "kind": "inline",
      "integrity": { "algo": "sha256", "hash": "..." }
    }
    ```

## 저장: 메타데이터 전용

Vineyard 배포의 가장 중요한 속성은 레지스트리가 **저장하지 않는** 것입니다:

- 레지스트리는 **경로/메타데이터만** 보유합니다. 번들 콘텐츠의 **서버 측 복사본이 없습니다**.
- **클라이언트**가 GitHub에서 번들을 다운로드하고 **로컬에 캐시**하여 실행합니다(웹: IndexedDB, 데스크톱: 파일 시스템). 카탈로그는 GitHub 릴리스를 가리키고, 앱이 바이트를 가져와 캐시합니다.

### `integrity`가 실제로 하는 일

선택적 `integrity` 해시는 **설치 시** 가져온 번들에 대해 확인됩니다. 이의 유일한 역할은 제출과 설치 사이의 **악의적인 강제 푸시**를 감지하는 것입니다 — 즉, `repo@ref`의 바이트가 더 이상 검토된 것과 일치하지 않는 경우입니다. (주석 태그는 이동될 수 있습니다. 커밋 SHA는 이동될 수 없지만, 해시는 어느 쪽이든 확인된 콘텐츠를 보호합니다.)

[로컬 개발](quickstart.md) 중에는 Developer Mode가 무결성 검사를 완전히 건너뛸 수 있습니다.

## 설치 흐름에서의 위치

앱 측 설치 파이프라인은 항목을 확인하고, `repo@ref/path`에서 전체 매니페스트를 가져오고, `distribution.kind`에 따라 번들을 가져오고(zip 자산 / git 트리 / inline), **선택적** 해시 확인을 실행하고, 바이트를 **클라이언트 측 전용**으로 캐시하고, 스코프 승인 대화상자를 표시하고, 활성화합니다. 전체 파이프라인과 제출/검토 게이트는 [publishing](publishing.md)을 참조하세요.

## 다음 / 참고

- [publishing](publishing.md) — 단일 항목 PR 제출. 불변 `ref` 및 무결성 게이트.
- [updates](updates.md) — 새로운 `ref`가 스코프 차이와 함께 제공된 업그레이드로 표시되는 방식.
- [quickstart](quickstart.md) — Developer Mode는 GitHub 없이 번들을 로드합니다.
- [plugin manifest](plugin-manifest.md) 및 [Type Pack schema](../reference/typepack-schema.md) — 둘 다 이 블록을 임베드합니다.
- [registry schema](../reference/registry-schema.md) — 메타데이터 전용 항목이 저장하는 것.
