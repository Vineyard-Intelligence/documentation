# Distribution

`distribution` 블록은 플러그인이나 Type Pack의 소스가 어디에 있는지를 기록합니다. 공유 스키마는 이 블록을 허용하지만, Vineyard 클라이언트는 현재 이를 읽지 않습니다. 앱이 무엇을 로드할지는 레지스트리 항목(`repo`, `ref`, `path`)과, 플러그인의 경우 `platforms.web.entry`가 결정합니다. 하나의 동일한 블록 형태가 두 콘텐츠 유형 모두에서 사용됩니다 — 별도의 플러그인 대 Type Pack 배포 형식은 없습니다.

## 공유 블록

```jsonc
"distribution": {
  "kind": "git",                            // git | zip | inline
  "repository": "https://github.com/owner/repo",
  "ref": "9f1c2ad7...e6f7",                 // 참고용. 고정되는 것은 레지스트리 항목의 ref
  "path": "manifest.json",                  // repo@ref 내의 파일 (git kind)
  "integrity": { "algo": "sha256", "hash": "..." },          // 선택 사항
  "archive": { "url": "https://....zip", "sha256": "..." }   // 선택 사항 (zip kind)
}
```

전체 필드별 참조는 [registry schema](../reference/registry-schema.md)에 있습니다. 이 블록을 임베드하는 플러그인/Type Pack 스키마는 [plugin manifest](plugin-manifest.md)와 [Type Pack schema](../reference/typepack-schema.md)에 있습니다.

!!! warning "`ref`는 불변이어야 합니다 — 브랜치와 태그는 거부됨"
    레지스트리 항목의 `ref`(`packs/<identifier>.json`에 있는 값)는 40-16진수 또는 64-16진수 커밋 SHA여야 합니다. 브랜치와 태그는 검토 후 옮겨질 수 있으므로 항목 스키마와 `verify_pinned.py`가 **거부**합니다. 매니페스트 안의 `distribution.ref`는 CI가 검사하지도, 클라이언트가 읽지도 않습니다. 새 버전이 업데이트로 제공되는 방식은 [updates](updates.md)를 참조하세요.

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

    `archive.url`로 지정된 미리 빌드된 아카이브(일반적으로 GitHub 릴리스 자산)를 가져옵니다. `archive`가 있으면 `archive.sha256`은 필수입니다.

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

    `inline`은 스키마상 허용되는 `kind`이지만, 앱은 이를 실행할 수 없습니다. `platforms.web.entry`가 `inline`이거나 없고 상속받을 팩 수준 entry도 없는 플러그인은 실행 가능 목록에 나타나지 않습니다.

    ```jsonc
    "distribution": {
      "kind": "inline",
      "integrity": { "algo": "sha256", "hash": "..." }
    }
    ```

## 저장: 메타데이터 전용

- 레지스트리는 **경로/메타데이터만** 보유합니다(승인된 ref 목록에 기록되는 각 승인 문서의 SHA-256 포함). 번들 콘텐츠의 **서버 측 복사본이 없습니다**.
- **클라이언트**는 팩 콘텐츠를 jsDelivr 경유로, 항목의 커밋 SHA에 고정해 가져옵니다: 팩 문서는 프로젝트를 열 때마다, 플러그인 코드 모듈은 실행할 때마다 가져옵니다. 영속 로컬 캐시는 없습니다.

### `integrity`

`distribution.integrity`는 스키마상 허용되지만 아무것도 읽지 않습니다. 검증은 대신 레지스트리에서 옵니다: 클라이언트는 팩의 `repo@ref/path`가 `registry/approved-{plugin,type,skill}packs.json`에 있고, 가져온 문서가 거기 기록된 SHA-256과 일치할 때만 로드합니다. 레지스트리에 닿을 수 없으면 이 기기가 전에 검증한 포인터는 계속 로드되고, 나머지는 보류됩니다. 플러그인 코드 모듈(`platforms.web.entry`)이 매니페스트와 같은 버전과 라이선스를 선언하는지는 CI가 확인합니다([publishing](publishing.md#the-pin) 참조).

## 설치 흐름에서의 위치

Plugin Pack을 설치하면 설치 대화상자의 권한 보기를 위해 항목의 `repo@ref/path`에 있는 문서를 (jsDelivr 경유로) 가져오고(Skill Pack은 개요를 위해 가져옵니다), 프로젝트에 `{identifier, url, version}` 포인터를 저장합니다. 프로젝트를 열 때 각 포인터는 위와 같이 레지스트리 기준으로 검증되고, 플러그인의 `platforms.web.entry`는 같은 고정 커밋을 기준으로 해석되어 샌드박스 워커에서 로드됩니다. 제출/검토 게이트는 [publishing](publishing.md)을 참조하세요.

## 다음 / 참고

- [publishing](publishing.md) — 단일 항목 PR 제출. 불변 `ref` 및 무결성 게이트.
- [updates](updates.md) — 새 버전이 업데이트로 제공되는 방식.
- [quickstart](quickstart.md) — Developer Mode는 GitHub 없이 번들을 로드합니다.
- [plugin manifest](plugin-manifest.md) 및 [Type Pack schema](../reference/typepack-schema.md) — 둘 다 이 블록을 임베드합니다.
- [registry schema](../reference/registry-schema.md) — 메타데이터 전용 항목이 저장하는 것.
