## [1.14.0](https://github.com/bamiyanapp/karuta/compare/1.14.1...1.14.0) (2026-01-25)

### Features

* **db:** stock-historyのパーティションキーをitemIdに変更 ([#51](https://github.com/bamiyanapp/karuta/issues/51)) ([2aabeea](https://github.com/bamiyanapp/karuta/commit/2aabeeaf62bbe8cac6ab3d53662466b74525ed44))
* **db:** データ構造の変更（userIdをパーティションキーに） ([#50](https://github.com/bamiyanapp/karuta/issues/50)) ([e92b7bd](https://github.com/bamiyanapp/karuta/commit/e92b7bd035489f68919125504c94e7814158d694))
* redesign stock management screen to focus on remaining estimation ([#54](https://github.com/bamiyanapp/karuta/issues/54)) ([b118f7f](https://github.com/bamiyanapp/karuta/commit/b118f7f049430ea5f246c3f36a6d5baa05b56e45))
* 日付ピッカーを追加して在庫予想を基準日付で表示 ([#66](https://github.com/bamiyanapp/karuta/issues/66)) ([db9336e](https://github.com/bamiyanapp/karuta/commit/db9336e9cf14ab41dbd328e6867b2d4c7eb54e8c))

### Bug Fixes

* **cd:** CDパイプラインのタグ重複エラーを修正 ([994b620](https://github.com/bamiyanapp/karuta/commit/994b62092ade0e40a3f7c4f199a055c7e4a072eb))
* **detail:** 詳細画面の履歴・推定データの取得を安定化 ([#59](https://github.com/bamiyanapp/karuta/issues/59)) ([7d1ea03](https://github.com/bamiyanapp/karuta/commit/7d1ea032f6e8d0e056ea01d4babf9c7c2d682a55))
* update cd.yml ([#48](https://github.com/bamiyanapp/karuta/issues/48)) ([7aa6abe](https://github.com/bamiyanapp/karuta/commit/7aa6abeeba02e61ff48ef1163a7c6b9c5c87c4fd))
* update cd.yml ([#53](https://github.com/bamiyanapp/karuta/issues/53)) ([e6be381](https://github.com/bamiyanapp/karuta/commit/e6be38107cdeaab6518c54345d5c502c7d1acd89))
* update cd.yml ([#55](https://github.com/bamiyanapp/karuta/issues/55)) ([d04cb95](https://github.com/bamiyanapp/karuta/commit/d04cb95cb75fc3f475e22efd18dc6f6d493c3b5e))
* update ci.yml ([747a949](https://github.com/bamiyanapp/karuta/commit/747a94985c3bbf13652c4eb3881dbd50a5f41b92))
* update ci.yml ([0776343](https://github.com/bamiyanapp/karuta/commit/07763435ff398d908fd099bb077fa03b71af2d2b))
* update ci.yml ([#47](https://github.com/bamiyanapp/karuta/issues/47)) ([c7f6eb6](https://github.com/bamiyanapp/karuta/commit/c7f6eb683f4120e811908a2efacd91a0d2726cfb))
* update ci.yml ([#56](https://github.com/bamiyanapp/karuta/issues/56)) ([2ee214c](https://github.com/bamiyanapp/karuta/commit/2ee214ca161714550b1db01927a5ada3101aba66))
## [1.14.1](https://github.com/bamiyanapp/karuta/compare/v1.13.0...1.14.1) (2026-01-14)

### Features

* **auth:** GoogleアカウントによるSSO認証機能の追加 ([#18](https://github.com/bamiyanapp/karuta/issues/18)) ([7359c2e](https://github.com/bamiyanapp/karuta/commit/7359c2e969e86477492fa64a3dbcdaecf927a807))
* **backend:** CORSエラー解消のための設定追加 ([#8](https://github.com/bamiyanapp/karuta/issues/8)) ([3b4419a](https://github.com/bamiyanapp/karuta/commit/3b4419af2785c371a1d73c3078956a41b3894bf0))
* **backend:** ハンドラー関数のテスト実装 ([f5639c1](https://github.com/bamiyanapp/karuta/commit/f5639c1fb2eb142bb41c84d8a140d2431553de89))
* **backend:** 在庫履歴のテストデータ拡充と計算ロジックの検証テスト追加 ([bf1fac1](https://github.com/bamiyanapp/karuta/commit/bf1fac15c120481449ac902af7ffb95ec9b62d56))
* **deploy:** AWSデプロイ時のデータ損失防止策の導入 ([#21](https://github.com/bamiyanapp/karuta/issues/21)) ([8bc890b](https://github.com/bamiyanapp/karuta/commit/8bc890b10e0283a706bf5fb8a929404a8c04f839))
* **frontend:** 在庫一覧に現在日付と在庫切れ予想日数を表示 ([fb4bd6d](https://github.com/bamiyanapp/karuta/commit/fb4bd6d5f45d1505e8a2c77baac4de1167b52b59))
* **infra:** DynamoDBテーブル名にサービス名を追加 ([ec48c69](https://github.com/bamiyanapp/karuta/commit/ec48c69734aa649637c84586f233cd09fc0f5749))
* **infra:** serverless.ymlのリソース名を更新し、polly関連設定を削除 ([05d614d](https://github.com/bamiyanapp/karuta/commit/05d614dbf7acfac2d71094eb5a25569440ea9718))
* **release:** ローカル環境でのSemantic Release実行に対応 ([d75bdcb](https://github.com/bamiyanapp/karuta/commit/d75bdcb9f8eab33b114cc5f170a5dc81bc8981fd))
* **stock:** 在庫推移グラフの改善と予測ロジックの詳細化 ([7d85f34](https://github.com/bamiyanapp/karuta/commit/7d85f34e54f16f2596e267f5f2c6d08015fb2709))
* **stock:** 在庫更新UIと予測ロジックの改善 ([#13](https://github.com/bamiyanapp/karuta/issues/13)) ([261f33c](https://github.com/bamiyanapp/karuta/commit/261f33cbc25a720017565c93eb4f62ab352feb72))
* **stock:** 在庫更新UIと予測ロジックの改善 ([#15](https://github.com/bamiyanapp/karuta/issues/15)) ([3f778bb](https://github.com/bamiyanapp/karuta/commit/3f778bb437e190f8c019d12059356e6857c99ade))
* **stock:** 家庭用品在庫管理機能の実装 ([1f1c639](https://github.com/bamiyanapp/karuta/commit/1f1c639ba3f61ee85ac4a4c23cff1b7aadbbce8a))
* **test:** 在庫切れ予測確認のためのテストデータ投入スクリプトを追加 ([#12](https://github.com/bamiyanapp/karuta/issues/12)) ([696382e](https://github.com/bamiyanapp/karuta/commit/696382eb4d276953ddc0693be1837e946ab8a5c5))
* **ui:** 品目追加フォームを在庫一覧の最下部に移動 ([#16](https://github.com/bamiyanapp/karuta/issues/16)) ([3a845bd](https://github.com/bamiyanapp/karuta/commit/3a845bd2ca17ed04a32edb62f4e3b5607ec09f49))
* **ui:** 在庫更新をプルダウンからボタン操作に変更 ([0c0b331](https://github.com/bamiyanapp/karuta/commit/0c0b331972ddf7add94112b01486abcfda888111))
* 在庫更新をプルダウン化し、品目詳細ページと消費履歴グラフを追加 ([#10](https://github.com/bamiyanapp/karuta/issues/10)) ([bb8e49a](https://github.com/bamiyanapp/karuta/commit/bb8e49a3d2b14f241e8b54602aeab34c34089786))
* 複数ユーザー対応とテスト用ユーザー切替機能の追加 ([#17](https://github.com/bamiyanapp/karuta/issues/17)) ([7fe3e6d](https://github.com/bamiyanapp/karuta/commit/7fe3e6d172d94013e022ad7901ced7dff16719d9))

### Bug Fixes

* **auth,api:** Googleログイン設定の修正とAPIエラーの解消 ([#26](https://github.com/bamiyanapp/karuta/issues/26)) ([65212bc](https://github.com/bamiyanapp/karuta/commit/65212bc89ca4b5cc9a03b0dab168570118bb4200))
* **auth:** Googleログイン設定の修正とバリデーションの強化 ([#22](https://github.com/bamiyanapp/karuta/issues/22)) ([3c98ec6](https://github.com/bamiyanapp/karuta/commit/3c98ec61844b222e12a89093e9a2441490a38d12))
* **backend:** API GatewayでのCORSエラーを修正 ([#7](https://github.com/bamiyanapp/karuta/issues/7)) ([c2700ba](https://github.com/bamiyanapp/karuta/commit/c2700ba8b6078f2e5efcff9e49e421bce60107e4))
* **backend:** CORS設定に x-user-id ヘッダーを追加 ([#20](https://github.com/bamiyanapp/karuta/issues/20)) ([97122cf](https://github.com/bamiyanapp/karuta/commit/97122cf93067d6234a5d7ef18008d3987aa2137b))
* **ci:** 自動マージ前にベースブランチの更新を取り込むように改善 ([#24](https://github.com/bamiyanapp/karuta/issues/24)) ([57ac0be](https://github.com/bamiyanapp/karuta/commit/57ac0beee110e2bba98d865f585ff5e734fea376))
* **deploy:** DynamoDBテーブル名の変更によるデプロイエラーの解消 ([#19](https://github.com/bamiyanapp/karuta/issues/19)) ([ec26ace](https://github.com/bamiyanapp/karuta/commit/ec26acebad8f756bc35ee25edb81369b853f6aaa))
* **frontend:** 品目追加時のUIフィードバックを改善 ([#6](https://github.com/bamiyanapp/karuta/issues/6)) ([32cc3f0](https://github.com/bamiyanapp/karuta/commit/32cc3f0b93a174d3d03aadd7b78d018102e95c42))
* **frontend:** 失敗するテストケースを削除 ([#1](https://github.com/bamiyanapp/karuta/issues/1)) ([654c9eb](https://github.com/bamiyanapp/karuta/commit/654c9eb5edf8d46836d8662cfaf11b74040764b6))
* **frontend:** 失敗するテストケースを削除 ([#4](https://github.com/bamiyanapp/karuta/issues/4)) ([63ff065](https://github.com/bamiyanapp/karuta/commit/63ff065d0a884708926e0b15a41922cc831808c1))
* marge ([#46](https://github.com/bamiyanapp/karuta/issues/46)) ([4236120](https://github.com/bamiyanapp/karuta/commit/42361205eb46ce64487e69c15650e9e6467e8236)), closes [#47](https://github.com/bamiyanapp/karuta/issues/47)
* update .releaserc.cjs ([#40](https://github.com/bamiyanapp/karuta/issues/40)) ([0a4ef6d](https://github.com/bamiyanapp/karuta/commit/0a4ef6de3046b1a6d7cdec87596dcf44c7b62ddd))
* update cd.yml ([972e676](https://github.com/bamiyanapp/karuta/commit/972e67638b18788c6d44e7fe7e355cb64e379b39))
* update cd.yml ([#31](https://github.com/bamiyanapp/karuta/issues/31)) ([8a68b6a](https://github.com/bamiyanapp/karuta/commit/8a68b6ae722be2e837ceced13338a7d2f6eba153))
* update cd.yml ([#32](https://github.com/bamiyanapp/karuta/issues/32)) ([86e0f94](https://github.com/bamiyanapp/karuta/commit/86e0f94cdac7ebcec645e3809f798f85ff515933))
* update cd.yml ([#33](https://github.com/bamiyanapp/karuta/issues/33)) ([83bfabd](https://github.com/bamiyanapp/karuta/commit/83bfabda38018b6e4856672926e93db64bf5b8a2))
* update cd.yml ([#34](https://github.com/bamiyanapp/karuta/issues/34)) ([c88430e](https://github.com/bamiyanapp/karuta/commit/c88430ec4ce1ab9d9797a9cd65e215d69d527379))
* update cd.yml ([#35](https://github.com/bamiyanapp/karuta/issues/35)) ([8176dec](https://github.com/bamiyanapp/karuta/commit/8176decaed3da717a423614fcd017dad5fbb04cd))
* update cd.yml ([#38](https://github.com/bamiyanapp/karuta/issues/38)) ([0844114](https://github.com/bamiyanapp/karuta/commit/0844114f9d4b407aeacdea3691a661e06f76e892))
* update cd.yml ([#39](https://github.com/bamiyanapp/karuta/issues/39)) ([4f5eb1c](https://github.com/bamiyanapp/karuta/commit/4f5eb1ce86d48620944ffcd5ad13c9b5dbfa65a5))
* update cd.yml ([#41](https://github.com/bamiyanapp/karuta/issues/41)) ([3ed4521](https://github.com/bamiyanapp/karuta/commit/3ed45217f097037e65cb203738a149acf0b02a04))
* update cd.yml ([#42](https://github.com/bamiyanapp/karuta/issues/42)) ([f657cbf](https://github.com/bamiyanapp/karuta/commit/f657cbfe9010abd501817261676c420f890687c5))
* update ci.yml ([#37](https://github.com/bamiyanapp/karuta/issues/37)) ([437417d](https://github.com/bamiyanapp/karuta/commit/437417debc5a40236669c2fcf5e1af896cbd29fe))
* デバッグ ([#9](https://github.com/bamiyanapp/karuta/issues/9)) ([ddc51b9](https://github.com/bamiyanapp/karuta/commit/ddc51b969782d87dea64f837db6a648ab3283de5))
* 空コミット ([93ae888](https://github.com/bamiyanapp/karuta/commit/93ae888ef5b958deefd98d2f0117a570238ff9ef))
## [1.13.0](https://github.com/bamiyanapp/karuta/compare/v0.0.318...v1.13.0) (2026-01-12)

### Bug Fixes

* update .releaserc.cjs ([#123](https://github.com/bamiyanapp/karuta/issues/123)) ([66707cf](https://github.com/bamiyanapp/karuta/commit/66707cf3031da4e495cc2989df2e330ad43179a1))
* update .releaserc.cjs ([#125](https://github.com/bamiyanapp/karuta/issues/125)) ([9a2fc23](https://github.com/bamiyanapp/karuta/commit/9a2fc2353db3f89dbbfff3145e05c866cb451084))
* update cd.yml ([#102](https://github.com/bamiyanapp/karuta/issues/102)) ([8644dd9](https://github.com/bamiyanapp/karuta/commit/8644dd9cb9c9bd83a85af6ac7f6fa71a4dc990dc))
* update cd.yml ([#103](https://github.com/bamiyanapp/karuta/issues/103)) ([571b873](https://github.com/bamiyanapp/karuta/commit/571b873f4c3ea8d1ffb02230aecfb048e161f718))
* update cd.yml ([#104](https://github.com/bamiyanapp/karuta/issues/104)) ([76bb29a](https://github.com/bamiyanapp/karuta/commit/76bb29a725aeccbf2831dfa62f6eaf038687b436))
* update cd.yml ([#105](https://github.com/bamiyanapp/karuta/issues/105)) ([dec7baf](https://github.com/bamiyanapp/karuta/commit/dec7baf86593abf4bd26794a022b734fb26f888c))
* update cd.yml ([#106](https://github.com/bamiyanapp/karuta/issues/106)) ([ea41387](https://github.com/bamiyanapp/karuta/commit/ea4138779c3e3ecf0d1c0e16283d61b3f97f44d0))
* update cd.yml ([#107](https://github.com/bamiyanapp/karuta/issues/107)) ([e8950c1](https://github.com/bamiyanapp/karuta/commit/e8950c1f5e98675625320b4174ca8abc2e63d160))
* update cd.yml ([#108](https://github.com/bamiyanapp/karuta/issues/108)) ([3c85a37](https://github.com/bamiyanapp/karuta/commit/3c85a3799092a4f51393db9263cc9a2b8b91f6f5))
* update cd.yml ([#111](https://github.com/bamiyanapp/karuta/issues/111)) ([c9bd2b4](https://github.com/bamiyanapp/karuta/commit/c9bd2b440683a4a34a811a23c8e0f1126935ac02))
* update cd.yml ([#112](https://github.com/bamiyanapp/karuta/issues/112)) ([0f2e2f8](https://github.com/bamiyanapp/karuta/commit/0f2e2f8109f6849033e935e663d2b58ae2d1f7b9))
* update cd.yml ([#114](https://github.com/bamiyanapp/karuta/issues/114)) ([c9a268b](https://github.com/bamiyanapp/karuta/commit/c9a268bafbd7eef8c8c73d201c8a16262074eb34))
* update cd.yml ([#115](https://github.com/bamiyanapp/karuta/issues/115)) ([a1e9657](https://github.com/bamiyanapp/karuta/commit/a1e965764f06c49d05c2801aa0091fae983ce1a1))
* update cd.yml ([#117](https://github.com/bamiyanapp/karuta/issues/117)) ([3d3b472](https://github.com/bamiyanapp/karuta/commit/3d3b472c4141141ecfc89415d9d71a09b33b4791))
* update cd.yml ([#120](https://github.com/bamiyanapp/karuta/issues/120)) ([c9fe02a](https://github.com/bamiyanapp/karuta/commit/c9fe02ae935609c567fad158603cf847a6d75651))
* update ci.yml ([#100](https://github.com/bamiyanapp/karuta/issues/100)) ([a348f4b](https://github.com/bamiyanapp/karuta/commit/a348f4b72211764fa29ded69e0be5ff7829dbd58))
* update ci.yml ([#101](https://github.com/bamiyanapp/karuta/issues/101)) ([f324fa9](https://github.com/bamiyanapp/karuta/commit/f324fa9c6a3b7483394c828eaf89572106c00dc4))
* update ci.yml ([#109](https://github.com/bamiyanapp/karuta/issues/109)) ([3801e6d](https://github.com/bamiyanapp/karuta/commit/3801e6db7bec73497eae08c9397609776fec97f3))
* update ci.yml ([#110](https://github.com/bamiyanapp/karuta/issues/110)) ([55c81ed](https://github.com/bamiyanapp/karuta/commit/55c81ed287409427150297c71a1eab86a0923c54))
* update cicd-pipeline-specification.md ([#118](https://github.com/bamiyanapp/karuta/issues/118)) ([730db51](https://github.com/bamiyanapp/karuta/commit/730db51a5be4276ff27773934472688d92096fe6))
* v13のログ重複削除 ([#124](https://github.com/bamiyanapp/karuta/issues/124)) ([f5a602e](https://github.com/bamiyanapp/karuta/commit/f5a602eaf17ab0771463d34c9e5ceae2ee867191))
## [0.0.318](https://github.com/bamiyanapp/karuta/compare/v0.0.317...v0.0.318) (2026-01-11)

### Bug Fixes

* update ci.yml ([#96](https://github.com/bamiyanapp/karuta/issues/96)) ([0025698](https://github.com/bamiyanapp/karuta/commit/002569883a51c82595e55181a7848281ca3ea2d9))
## [0.0.317](https://github.com/bamiyanapp/karuta/compare/v0.0.316...v0.0.317) (2026-01-11)

### Bug Fixes

* update ci.yml ([#95](https://github.com/bamiyanapp/karuta/issues/95)) ([f15d4eb](https://github.com/bamiyanapp/karuta/commit/f15d4eb0afdf9567329454602940aef64b554699))
## [0.0.316](https://github.com/bamiyanapp/karuta/compare/v0.0.315...v0.0.316) (2026-01-11)

### Bug Fixes

* update cd.yml ([#94](https://github.com/bamiyanapp/karuta/issues/94)) ([f58ce70](https://github.com/bamiyanapp/karuta/commit/f58ce708457860ec2377c8879a14944ca7fe922f))
## [0.0.315](https://github.com/bamiyanapp/karuta/compare/v0.0.314...v0.0.315) (2026-01-11)

### Bug Fixes

* update ci.yml ([#93](https://github.com/bamiyanapp/karuta/issues/93)) ([2862fa2](https://github.com/bamiyanapp/karuta/commit/2862fa2f091875e796262264965fe30cf7cdde02))
## [0.0.314](https://github.com/bamiyanapp/karuta/compare/v0.0.313...v0.0.314) (2026-01-11)

### Bug Fixes

* update cd.yml ([#92](https://github.com/bamiyanapp/karuta/issues/92)) ([6abeb79](https://github.com/bamiyanapp/karuta/commit/6abeb79ad95f17887c95832e55164cbc89694aad))
## [0.0.313](https://github.com/bamiyanapp/karuta/compare/v0.0.312...v0.0.313) (2026-01-11)

### Bug Fixes

* update cd.yml ([#91](https://github.com/bamiyanapp/karuta/issues/91)) ([3183dfa](https://github.com/bamiyanapp/karuta/commit/3183dfa1645aad2af9f7c1e85d144e85929828d0))
## [0.0.312](https://github.com/bamiyanapp/karuta/compare/v0.0.311...v0.0.312) (2026-01-11)

### Bug Fixes

* update cd.yml ([#90](https://github.com/bamiyanapp/karuta/issues/90)) ([4248ad0](https://github.com/bamiyanapp/karuta/commit/4248ad0f849d2349b09a30c7c6fc5067b057e5bb))
## [0.0.311](https://github.com/bamiyanapp/karuta/compare/v0.0.310...v0.0.311) (2026-01-11)

### Bug Fixes

* update cd.yml ([#89](https://github.com/bamiyanapp/karuta/issues/89)) ([1ef81f4](https://github.com/bamiyanapp/karuta/commit/1ef81f413172865afe1f5a03e7a6929d3fdbe94a))
## [0.0.310](https://github.com/bamiyanapp/karuta/compare/v0.0.309...v0.0.310) (2026-01-11)
## [0.0.309](https://github.com/bamiyanapp/karuta/compare/v0.0.308...v0.0.309) (2026-01-11)

### Bug Fixes

* update ci.yml ([#86](https://github.com/bamiyanapp/karuta/issues/86)) ([1c741dc](https://github.com/bamiyanapp/karuta/commit/1c741dce55e58494ce88dfeeba966a96816ce0e5))
## [0.0.308](https://github.com/bamiyanapp/karuta/compare/v0.0.307...v0.0.308) (2026-01-11)

### Bug Fixes

* **changelog:** 更新履歴の最新バージョンで時刻が表示されない問題を修正 ([#85](https://github.com/bamiyanapp/karuta/issues/85)) ([2dbbc9b](https://github.com/bamiyanapp/karuta/commit/2dbbc9b29a7acd26fd78e5dbc79e594d40fb6314))
## [0.0.307](https://github.com/bamiyanapp/karuta/compare/v0.0.306...v0.0.307) (2026-01-11)

### Bug Fixes

* update ci.yml ([#84](https://github.com/bamiyanapp/karuta/issues/84)) ([60aca66](https://github.com/bamiyanapp/karuta/commit/60aca666e13c5dbd3ac861810e5dc58d04e1a9b1))
## [0.0.306](https://github.com/bamiyanapp/karuta/compare/v0.0.305...v0.0.306) (2026-01-11)

### Bug Fixes

* update ci.yml ([#83](https://github.com/bamiyanapp/karuta/issues/83)) ([5ff89b3](https://github.com/bamiyanapp/karuta/commit/5ff89b30e31176b7999474bb82990496e29d71c9))
## [0.0.305](https://github.com/bamiyanapp/karuta/compare/v0.0.304...v0.0.305) (2026-01-11)

### Bug Fixes

* update ci.yml ([#82](https://github.com/bamiyanapp/karuta/issues/82)) ([b35ff9d](https://github.com/bamiyanapp/karuta/commit/b35ff9d9e10ba6664323781aba01674299dc3012))
## [0.0.304](https://github.com/bamiyanapp/karuta/compare/v0.0.303...v0.0.304) (2026-01-11)

### Bug Fixes

* **ci:** cd.yml および ci.yml をコミット b2b221f の状態に戻す ([#80](https://github.com/bamiyanapp/karuta/issues/80)) ([dcddd5a](https://github.com/bamiyanapp/karuta/commit/dcddd5a42b20adffcfcb5992333af8c0af5c66df))
## [0.0.303](https://github.com/bamiyanapp/karuta/compare/v0.0.302...v0.0.303) (2026-01-11)

### Bug Fixes

* update ci.yml ([#79](https://github.com/bamiyanapp/karuta/issues/79)) ([9130dfe](https://github.com/bamiyanapp/karuta/commit/9130dfe37e82bbab5fc57102bc6ac048494fd896))
## [0.0.302](https://github.com/bamiyanapp/karuta/compare/v0.0.301...v0.0.302) (2026-01-11)

### Bug Fixes

* update ci.yml ([#78](https://github.com/bamiyanapp/karuta/issues/78)) ([0447ca6](https://github.com/bamiyanapp/karuta/commit/0447ca6ab04d80b41f6765b73c3b7349d08a86c9))
## [0.0.301](https://github.com/bamiyanapp/karuta/compare/v0.0.300...v0.0.301) (2026-01-11)

### Bug Fixes

* update ci.yml ([#77](https://github.com/bamiyanapp/karuta/issues/77)) ([10cd89f](https://github.com/bamiyanapp/karuta/commit/10cd89ff435b6acc25d27aa684b80c6d262807e9))
## [0.0.300](https://github.com/bamiyanapp/karuta/compare/v0.0.299...v0.0.300) (2026-01-11)
## [0.0.299](https://github.com/bamiyanapp/karuta/compare/v0.0.298...v0.0.299) (2026-01-11)
## [0.0.298](https://github.com/bamiyanapp/karuta/compare/v0.0.297...v0.0.298) (2026-01-11)

### Bug Fixes

* update cd.yml ([#74](https://github.com/bamiyanapp/karuta/issues/74)) ([b2b221f](https://github.com/bamiyanapp/karuta/commit/b2b221f6bb680718d156037c629d984e876715e8))
## [0.0.297](https://github.com/bamiyanapp/karuta/compare/v0.0.296...v0.0.297) (2026-01-11)

### Bug Fixes

* update cd.yml ([#73](https://github.com/bamiyanapp/karuta/issues/73)) ([f68e7fd](https://github.com/bamiyanapp/karuta/commit/f68e7fd721b3ca701821437dbfe0bdeaf4a0886e))
## [0.0.296](https://github.com/bamiyanapp/karuta/compare/v0.0.295...v0.0.296) (2026-01-11)

### Bug Fixes

* update cd.yml ([#72](https://github.com/bamiyanapp/karuta/issues/72)) ([ff3a3ff](https://github.com/bamiyanapp/karuta/commit/ff3a3ff10bbe4f1575994d29059680e0e712fddb))
## [0.0.295](https://github.com/bamiyanapp/karuta/compare/v0.0.294...v0.0.295) (2026-01-11)

### Bug Fixes

* update .releaserc.cjs ([#71](https://github.com/bamiyanapp/karuta/issues/71)) ([3027254](https://github.com/bamiyanapp/karuta/commit/3027254b743cc8cf1676eefa375ce6aad16be4c7))
## [0.0.294](https://github.com/bamiyanapp/karuta/compare/v0.0.293...v0.0.294) (2026-01-11)

### Bug Fixes

* update cd.yml ([#70](https://github.com/bamiyanapp/karuta/issues/70)) ([20e6f0a](https://github.com/bamiyanapp/karuta/commit/20e6f0a90a4ba2b1f26e709e23d5a9ac9be19248))
## [0.0.293](https://github.com/bamiyanapp/karuta/compare/v0.0.292...v0.0.293) (2026-01-11)

### Bug Fixes

* update ci.yml ([#69](https://github.com/bamiyanapp/karuta/issues/69)) ([90aafb5](https://github.com/bamiyanapp/karuta/commit/90aafb5d62da62294d3424689db493c6dd860aab))
## [0.0.292](https://github.com/bamiyanapp/karuta/compare/v0.0.291...v0.0.292) (2026-01-11)

### Bug Fixes

* update .releaserc.cjs ([#67](https://github.com/bamiyanapp/karuta/issues/67)) ([#68](https://github.com/bamiyanapp/karuta/issues/68)) ([679f582](https://github.com/bamiyanapp/karuta/commit/679f58281e636eec4f312b4128725e2106079797))
## [0.0.291](https://github.com/bamiyanapp/karuta/compare/v0.0.290...v0.0.291) (2026-01-11)

### Bug Fixes

* update cd.yml ([#66](https://github.com/bamiyanapp/karuta/issues/66)) ([20b05da](https://github.com/bamiyanapp/karuta/commit/20b05daddb70fcb0980b17706ec71115560aad72))
## [0.0.290](https://github.com/bamiyanapp/karuta/compare/v0.0.289...v0.0.290) (2026-01-11)

### Bug Fixes

* update cd.yml ([#65](https://github.com/bamiyanapp/karuta/issues/65)) ([9e37b1b](https://github.com/bamiyanapp/karuta/commit/9e37b1b42d7f90c52460492f97de517470c70d06))
## [0.0.289](https://github.com/bamiyanapp/karuta/compare/v0.0.288...v0.0.289) (2026-01-11)

### Bug Fixes

* ci失敗を修正 ([#64](https://github.com/bamiyanapp/karuta/issues/64)) ([2f53c91](https://github.com/bamiyanapp/karuta/commit/2f53c91d6e69b2a0741b3845c62f3ced6fb92e6a))
## [0.0.288](https://github.com/bamiyanapp/karuta/compare/v0.0.287...v0.0.288) (2026-01-11)

### Bug Fixes

* update ci.yml ([#63](https://github.com/bamiyanapp/karuta/issues/63)) ([e040950](https://github.com/bamiyanapp/karuta/commit/e0409509a1de3ec8942a39ae35d94dd7b87cf2c8))
## [0.0.287](https://github.com/bamiyanapp/karuta/compare/v0.0.286...v0.0.287) (2026-01-11)
## [0.0.286](https://github.com/bamiyanapp/karuta/compare/v0.0.285...v0.0.286) (2026-01-10)

### Bug Fixes

* fetchの追加 ([#60](https://github.com/bamiyanapp/karuta/issues/60)) ([6bd2b38](https://github.com/bamiyanapp/karuta/commit/6bd2b388b637ada19be482f677a64e3dafb1e6c2))
## [0.0.285](https://github.com/bamiyanapp/karuta/compare/v0.0.284...v0.0.285) (2026-01-10)
## [0.0.284](https://github.com/bamiyanapp/karuta/compare/v0.0.283...v0.0.284) (2026-01-10)

### Bug Fixes

* 稼働条件を変更 ([#59](https://github.com/bamiyanapp/karuta/issues/59)) ([bf4a06f](https://github.com/bamiyanapp/karuta/commit/bf4a06feff683bdcc709ca377b36bf1a86832370))
## [0.0.283](https://github.com/bamiyanapp/karuta/compare/v0.0.282...v0.0.283) (2026-01-10)
## [0.0.282](https://github.com/bamiyanapp/karuta/compare/v0.0.281...v0.0.282) (2026-01-10)
## [0.0.281](https://github.com/bamiyanapp/karuta/compare/v0.0.280...v0.0.281) (2026-01-10)

### Bug Fixes

* **ci:** CDワークフローのトリガーとチェックアウト処理を改善 ([#53](https://github.com/bamiyanapp/karuta/issues/53)) ([385d719](https://github.com/bamiyanapp/karuta/commit/385d7194d19d056582ef9bfb11446d9375fc207c))
## [0.0.280](https://github.com/bamiyanapp/karuta/compare/v0.0.279...v0.0.280) (2026-01-10)

### Bug Fixes

* **ci:** CDパイプラインの実行条件とチェックアウト処理を改善 ([#52](https://github.com/bamiyanapp/karuta/issues/52)) ([bca7fd5](https://github.com/bamiyanapp/karuta/commit/bca7fd506a84d66984f3b9ba0a993ddd56521838))
## [0.0.279](https://github.com/bamiyanapp/karuta/compare/v0.0.278...v0.0.279) (2026-01-10)

### Features

* **backup:** DynamoDB PITRの有効化と運用仕様の追記 ([#50](https://github.com/bamiyanapp/karuta/issues/50)) ([4194dc7](https://github.com/bamiyanapp/karuta/commit/4194dc73dd816ec27eb4176fca7ccc4792037b1c))
## [0.0.278](https://github.com/bamiyanapp/karuta/compare/v0.0.277...v0.0.278) (2026-01-10)

### Features

* **readme:** ローカルのAWSアイコンを使用するように更新 ([#49](https://github.com/bamiyanapp/karuta/issues/49)) ([d059989](https://github.com/bamiyanapp/karuta/commit/d059989f2e5ac9d37e172911ddfdf4e82a1c89f2))
## [0.0.277](https://github.com/bamiyanapp/karuta/compare/v0.0.276...v0.0.277) (2026-01-10)
## [0.0.276](https://github.com/bamiyanapp/karuta/compare/v0.0.275...v0.0.276) (2026-01-10)
## [0.0.275](https://github.com/bamiyanapp/karuta/compare/v0.0.274...v0.0.275) (2026-01-10)
## [0.0.274](https://github.com/bamiyanapp/karuta/compare/v0.0.273...v0.0.274) (2026-01-10)
## [0.0.273](https://github.com/bamiyanapp/karuta/compare/v0.0.272...v0.0.273) (2026-01-10)
## [0.0.272](https://github.com/bamiyanapp/karuta/compare/v0.0.271...v0.0.272) (2026-01-10)
## [0.0.271](https://github.com/bamiyanapp/karuta/compare/v0.0.270...v0.0.271) (2026-01-10)

### Bug Fixes

* **ci:** CDワークフローの重複実行と不適切なタイミングでの実行を解消 ([#42](https://github.com/bamiyanapp/karuta/issues/42)) ([d4a49a9](https://github.com/bamiyanapp/karuta/commit/d4a49a9d28511acee2af4ef9d7a941fc33ac76e8))
## [0.0.270](https://github.com/bamiyanapp/karuta/compare/v0.0.269...v0.0.270) (2026-01-10)
## [0.0.269](https://github.com/bamiyanapp/karuta/compare/v0.0.268...v0.0.269) (2026-01-10)

### Bug Fixes

* **frontend:** 全札一覧のページタイトル修正と表記の統一 ([#40](https://github.com/bamiyanapp/karuta/issues/40)) ([f5c747b](https://github.com/bamiyanapp/karuta/commit/f5c747bcb3e84f084a98157d7b43b8ab729e3702))
## [0.0.268](https://github.com/bamiyanapp/karuta/compare/v0.0.267...v0.0.268) (2026-01-10)
## [0.0.267](https://github.com/bamiyanapp/karuta/compare/v0.0.266...v0.0.267) (2026-01-10)

### Bug Fixes

* **ci:** リリースジョブのスキップを解消 ([#38](https://github.com/bamiyanapp/karuta/issues/38)) ([2a6643c](https://github.com/bamiyanapp/karuta/commit/2a6643c0d142d1739a48891d8902e1e38e3700eb))
## [0.0.266](https://github.com/bamiyanapp/karuta/compare/v0.0.265...v0.0.266) (2026-01-10)

### Bug Fixes

* **ci:** cd.ymlの構文エラーを修正 ([#37](https://github.com/bamiyanapp/karuta/issues/37)) ([44a0a29](https://github.com/bamiyanapp/karuta/commit/44a0a299b79800f453e1e4d0497bfbd1c744ec35))
## [0.0.265](https://github.com/bamiyanapp/karuta/compare/v0.0.264...v0.0.265) (2026-01-10)

### Bug Fixes

* **ci:** リリースパイプラインの最終調整と安定化 ([#36](https://github.com/bamiyanapp/karuta/issues/36)) ([bd9c4aa](https://github.com/bamiyanapp/karuta/commit/bd9c4aa34ccd0b767441db0c78e0f1063255d853))
## [0.0.264](https://github.com/bamiyanapp/karuta/compare/v0.0.263...v0.0.264) (2026-01-10)
## [0.0.263](https://github.com/bamiyanapp/karuta/compare/v0.0.262...v0.0.263) (2026-01-10)

### Bug Fixes

* **ci:** CDワークフローでのチェックアウトエラーを修正 ([#34](https://github.com/bamiyanapp/karuta/issues/34)) ([03224e3](https://github.com/bamiyanapp/karuta/commit/03224e36fccd3abdef67b4c60b63d8655e3d98de))
## [0.0.262](https://github.com/bamiyanapp/karuta/compare/v0.0.261...v0.0.262) (2026-01-10)

### Bug Fixes

* **ci:** リリース対象をreleaseブランチに限定し権限エラーを回避 ([#33](https://github.com/bamiyanapp/karuta/issues/33)) ([7a4d378](https://github.com/bamiyanapp/karuta/commit/7a4d378309777c5096b2e90a51985d121bd5d346))
## [0.0.261](https://github.com/bamiyanapp/karuta/compare/v0.0.260...v0.0.261) (2026-01-10)

### Bug Fixes

* **ci:** semantic-releaseの設定改善と権限エラーの解消 ([#32](https://github.com/bamiyanapp/karuta/issues/32)) ([276caa7](https://github.com/bamiyanapp/karuta/commit/276caa71f88211169c9cf8215d1905d9df020982))
## [0.0.260](https://github.com/bamiyanapp/karuta/compare/v0.0.259...v0.0.260) (2026-01-10)

### Bug Fixes

* **ci:** マージ権限エラーの解消とCDトリガーの改善 ([#31](https://github.com/bamiyanapp/karuta/issues/31)) ([80ae7c2](https://github.com/bamiyanapp/karuta/commit/80ae7c2c8197d17481f7e2fe7410cd550954bbe3))
## [0.0.259](https://github.com/bamiyanapp/karuta/compare/v0.0.258...v0.0.259) (2026-01-10)

### Bug Fixes

* **ci:** mainブランチをリリース対象に再追加 ([#28](https://github.com/bamiyanapp/karuta/issues/28)) ([2e7cbd3](https://github.com/bamiyanapp/karuta/commit/2e7cbd38411a4e24535453163febeecec15f2910))
## [0.0.258](https://github.com/bamiyanapp/karuta/compare/v0.0.257...v0.0.258) (2026-01-10)

### Bug Fixes

* **ci:** mainブランチをリリース対象に再追加 ([#27](https://github.com/bamiyanapp/karuta/issues/27)) ([66a25da](https://github.com/bamiyanapp/karuta/commit/66a25da7e9608d4a135ea8db6841deaef0971c35))
## [0.0.257](https://github.com/bamiyanapp/karuta/compare/v0.0.256...v0.0.257) (2026-01-10)

### Features

* **ci:** integrate auto-merge into CI workflow for better reliability ([#26](https://github.com/bamiyanapp/karuta/issues/26)) ([49af638](https://github.com/bamiyanapp/karuta/commit/49af63851ca062af9f52766ce91a0b81226d50ef))
## [0.0.256](https://github.com/bamiyanapp/karuta/compare/v0.0.255...v0.0.256) (2026-01-10)

### Bug Fixes

* **ci:** リリースジョブの失敗を修正し、リリースフローをreleaseブランチに限定 ([#25](https://github.com/bamiyanapp/karuta/issues/25)) ([fdc5cea](https://github.com/bamiyanapp/karuta/commit/fdc5cea41cb10887a22a978195eb322ab5750a6d))
## [0.0.254](https://github.com/bamiyanapp/karuta/compare/v0.0.253...v0.0.254) (2026-01-10)

### Features

* **ci:** restructure pipeline into CI and CD for better reliability and visibility ([4b72d8a](https://github.com/bamiyanapp/karuta/commit/4b72d8a25f39bdeb57505069ae0e16e170434342))
## [0.0.253](https://github.com/bamiyanapp/karuta/compare/v0.0.252...v0.0.253) (2026-01-10)

### Bug Fixes

* **ci:** use github.ref for reliable branch detection in deploy workflow ([#23](https://github.com/bamiyanapp/karuta/issues/23)) ([563a515](https://github.com/bamiyanapp/karuta/commit/563a5158ef9110288898d46dbdb31b3e58d7fb80))
## [0.0.252](https://github.com/bamiyanapp/karuta/compare/v0.0.251...v0.0.252) (2026-01-10)

### Bug Fixes

* **ci:** restore main as release branch and update deploy workflow ([#22](https://github.com/bamiyanapp/karuta/issues/22)) ([66dd489](https://github.com/bamiyanapp/karuta/commit/66dd489846d1110a01c9673534176faabae16adf))
## [0.0.251](https://github.com/bamiyanapp/karuta/compare/v0.0.250...v0.0.251) (2026-01-10)
## [0.0.250](https://github.com/bamiyanapp/karuta/compare/v0.0.249...v0.0.250) (2026-01-10)

### Bug Fixes

* **ci:** restore main as release branch and update deploy workflow ([#20](https://github.com/bamiyanapp/karuta/issues/20)) ([2953910](https://github.com/bamiyanapp/karuta/commit/29539100612f742b7033deeca1b473893562e89e))
## [0.0.249](https://github.com/bamiyanapp/karuta/compare/v0.0.248...v0.0.249) (2026-01-10)

### Bug Fixes

* 全札一覧のページタイトル修正とAgentパイプラインの復旧 ([#19](https://github.com/bamiyanapp/karuta/issues/19)) ([f0f0429](https://github.com/bamiyanapp/karuta/commit/f0f0429550f13062bf622afb6e9e09ff08ea6242))
## [0.0.248](https://github.com/bamiyanapp/karuta/compare/v0.0.247...v0.0.248) (2026-01-10)
## [0.0.247](https://github.com/bamiyanapp/karuta/compare/v0.0.246...v0.0.247) (2026-01-10)
## [0.0.246](https://github.com/bamiyanapp/karuta/compare/v0.0.245...v0.0.246) (2026-01-10)

### Features

* **ci:** delete branch after successful auto-merge ([#15](https://github.com/bamiyanapp/karuta/issues/15)) ([2e19ff6](https://github.com/bamiyanapp/karuta/commit/2e19ff61f617708c5f7a243ab87754b1a8d32e73))
## [0.0.241](https://github.com/bamiyanapp/karuta/compare/v0.0.240...v0.0.241) (2026-01-10)
## [0.0.240](https://github.com/bamiyanapp/karuta/compare/v0.0.239...v0.0.240) (2026-01-10)
## [0.0.237](https://github.com/bamiyanapp/karuta/compare/v0.0.236...v0.0.237) (2026-01-10)

### Features

* **agent:** enhance agent prompt and logic for autonomous lifecycle ([7b4099f](https://github.com/bamiyanapp/karuta/commit/7b4099fcc97de104d08d3842fa1c61329d7195be))
## [0.0.241](https://github.com/bamiyanapp/karuta/compare/v0.0.240...v0.0.241) (2026-01-10)
## [0.0.240](https://github.com/bamiyanapp/karuta/compare/v0.0.239...v0.0.240) (2026-01-10)
## [0.0.238](https://github.com/bamiyanapp/karuta/compare/v0.0.237...v0.0.238) (2026-01-10)

### Bug Fixes

* **ci:** fix permission error in auto-merge workflow ([7084fae](https://github.com/bamiyanapp/karuta/commit/7084fae9b1da5ce23c6cf263903c134598772234))
## [0.0.237](https://github.com/bamiyanapp/karuta/compare/v0.0.236...v0.0.237) (2026-01-10)

### Features

* **agent:** enhance agent prompt and logic for autonomous lifecycle ([7b4099f](https://github.com/bamiyanapp/karuta/commit/7b4099fcc97de104d08d3842fa1c61329d7195be))
## [0.0.238](https://github.com/bamiyanapp/karuta/compare/v0.0.237...v0.0.238) (2026-01-10)

### Bug Fixes

* **ci:** fix permission error in auto-merge workflow ([7084fae](https://github.com/bamiyanapp/karuta/commit/7084fae9b1da5ce23c6cf263903c134598772234))
## [0.0.237](https://github.com/bamiyanapp/karuta/compare/v0.0.236...v0.0.237) (2026-01-10)

### Features

* **agent:** enhance agent prompt and logic for autonomous lifecycle ([7b4099f](https://github.com/bamiyanapp/karuta/commit/7b4099fcc97de104d08d3842fa1c61329d7195be))
## [0.0.236](https://github.com/bamiyanapp/karuta/compare/v0.0.235...v0.0.236) (2026-01-10)

### Bug Fixes

* **agent:** change gemini model to gemini-1.5-flash to fix 404 error ([0b477db](https://github.com/bamiyanapp/karuta/commit/0b477db9baccdf2d4b1d75e8601545629bcd52ec))
## [0.0.234](https://github.com/bamiyanapp/karuta/compare/v0.0.233...v0.0.234) (2026-01-10)

### Features

* **agent:** restrict runner to authorized users and allow title trigger ([03e7a8d](https://github.com/bamiyanapp/karuta/commit/03e7a8dd2cb4babab85af36bf06d0e3387be25cb))
## [0.0.233](https://github.com/bamiyanapp/karuta/compare/v0.0.232...v0.0.233) (2026-01-10)

### Bug Fixes

* **agent:** trigger runner when issue title contains [agent] ([19d3c15](https://github.com/bamiyanapp/karuta/commit/19d3c1510dbc8451ebf7486a7c84a74e4fc562a1))
## [0.0.231](https://github.com/bamiyanapp/karuta/compare/v0.0.230...v0.0.231) (2026-01-10)

### Bug Fixes

* コミットリントのルール修正 ([60ed0be](https://github.com/bamiyanapp/karuta/commit/60ed0be661fb84faa7e640fd528c034960f72bc3))
## [0.0.229](https://github.com/bamiyanapp/karuta/compare/v0.0.228...v0.0.229) (2026-01-10)

### Bug Fixes

* semanticリリース対応 ([28c211a](https://github.com/bamiyanapp/karuta/commit/28c211aa2e08c0f4c37fed633367fc1c0209e990))
## [0.0.228](https://github.com/bamiyanapp/karuta/compare/v0.0.227...v0.0.228) (2026-01-09)

### Bug Fixes

* **ci:** fix semantic-release failures by explicitly setting repository info and git author ([45897bd](https://github.com/bamiyanapp/karuta/commit/45897bd97550b56c7d15b0a12971caef217badf3))
## [0.0.226](https://github.com/bamiyanapp/karuta/compare/v0.0.225...v0.0.226) (2026-01-07)

### Bug Fixes

* **ci:** fix permission issue in auto-merge and ignore coverage in lint ([b21f9bb](https://github.com/bamiyanapp/karuta/commit/b21f9bb7223e0696ab74da298a16ac42b2c2f9cd))
## [0.0.223](https://github.com/bamiyanapp/karuta/compare/v0.0.222...v0.0.223) (2026-01-07)

### Bug Fixes

* **release:** use BOT_TOKEN for checkout and release steps ([9ba56d7](https://github.com/bamiyanapp/karuta/commit/9ba56d78b079306dba78c4a35fa5e96750b3c5eb))
## [0.0.221](https://github.com/bamiyanapp/karuta/compare/v0.0.220...v0.0.221) (2026-01-07)

### Bug Fixes

* **release:** use BOT_TOKEN to bypass branch protection ([563f496](https://github.com/bamiyanapp/karuta/commit/563f496d07ed5ef1a043052c173d1fa5ff2b35bd))
## [0.0.219](https://github.com/bamiyanapp/karuta/compare/v0.0.218...v0.0.219) (2026-01-07)

### Bug Fixes

* trigger pipeline with valid message ([4c660f9](https://github.com/bamiyanapp/karuta/commit/4c660f98b54469e4da3b5b5f3252e6ececc83bda))
## [0.0.218](https://github.com/bamiyanapp/karuta/compare/v0.0.217...v0.0.218) (2026-01-07)

### Features

* improve agent pipeline reliability ([02a2472](https://github.com/bamiyanapp/karuta/commit/02a2472f9400ab8f8c3256822ff151db9247fbd6))
## [0.0.215](https://github.com/bamiyanapp/karuta/compare/v1.12.1...v0.0.215) (2026-01-07)

### Bug Fixes

* コード生成をエージェントパイプライン化する ([5720177](https://github.com/bamiyanapp/karuta/commit/5720177272d627f33313fc4f1489b9980ac8e77c))
## [0.0.212](https://github.com/bamiyanapp/karuta/compare/v0.0.211...v0.0.212) (2026-01-06)
## [0.0.211](https://github.com/bamiyanapp/karuta/compare/v1.12.0...v0.0.211) (2026-01-06)

### Bug Fixes

* clineのシステムプロンプトを追加 ([9282355](https://github.com/bamiyanapp/karuta/commit/928235585f3f24885f3cf9b6221b59d717182248))
## [0.0.209](https://github.com/bamiyanapp/karuta/compare/v0.0.208...v0.0.209) (2026-01-04)

### Features

* display elapsed time in history ([966231c](https://github.com/bamiyanapp/karuta/commit/966231c24d3f11a502fc1c3d0ecde14f0b41c31f))
## [0.0.208](https://github.com/bamiyanapp/karuta/compare/v1.11.0...v0.0.208) (2026-01-04)
## [0.0.206](https://github.com/bamiyanapp/karuta/compare/v1.10.0...v0.0.206) (2026-01-04)

### Features

* フェードで札と結果を切り替える ([21b0f12](https://github.com/bamiyanapp/karuta/commit/21b0f12e3c6b27003e1d14696234b46362ada1a8))
## [0.0.204](https://github.com/bamiyanapp/karuta/compare/v0.0.203...v0.0.204) (2026-01-04)

### Bug Fixes

* trigger semantic-release ([f019679](https://github.com/bamiyanapp/karuta/commit/f01967921f8d020f15118769a18b22bb5cbab389))
## [0.0.195](https://github.com/bamiyanapp/karuta/compare/v0.0.194...v0.0.195) (2026-01-04)

### Bug Fixes

* preserve averageDifficulty during seed ([8037593](https://github.com/bamiyanapp/karuta/commit/80375939c355a8ffded749fcc364b99844a03385))
## [0.0.194](https://github.com/bamiyanapp/karuta/compare/v1.9.2...v0.0.194) (2026-01-04)

### Reverts

* restore setTimeout based implementation to fix playback issues ([aa65809](https://github.com/bamiyanapp/karuta/commit/aa658099f5ae105a2f36b40fbea3a0a1da3edea6))
## [0.0.192](https://github.com/bamiyanapp/karuta/compare/v1.9.1...v0.0.192) (2026-01-04)

### Bug Fixes

* continue animation even if audio playback fails ([95b6fb6](https://github.com/bamiyanapp/karuta/commit/95b6fb671099f2062e6f0ec86c88329bd928a182))
## [0.0.190](https://github.com/bamiyanapp/karuta/compare/v0.0.189...v0.0.190) (2026-01-04)
## [0.0.189](https://github.com/bamiyanapp/karuta/compare/v0.0.188...v0.0.189) (2026-01-04)

### Bug Fixes

* ensure phrase transition even if audio is short ([c04ede8](https://github.com/bamiyanapp/karuta/commit/c04ede8d801fa4e6b38c6d3253d7ca9468df5544))
## [0.0.188](https://github.com/bamiyanapp/karuta/compare/v1.9.0...v0.0.188) (2026-01-04)
## [0.0.186](https://github.com/bamiyanapp/karuta/compare/v1.8.0...v0.0.186) (2026-01-04)

### Features

* praise when time is faster than average ([d9abd2b](https://github.com/bamiyanapp/karuta/commit/d9abd2bad5585e1c22cb71bafd0662a684dc133d))
## [0.0.184](https://github.com/bamiyanapp/karuta/compare/v1.7.2...v0.0.184) (2026-01-04)

### Features

* show result (time and difficulty) after pressing next button ([6bd8d21](https://github.com/bamiyanapp/karuta/commit/6bd8d21eb7f41a035592791d64ebb7b10f73746e))
## [0.0.200](https://github.com/bamiyanapp/karuta/compare/v1.7.3...v0.0.200) (2026-01-04)

### Bug Fixes

* card not displaying on read ([169d5c5](https://github.com/bamiyanapp/karuta/commit/169d5c50f12d9a9a41a1f67ac30113a13a50280f))
## [0.0.198](https://github.com/bamiyanapp/karuta/compare/v0.0.197...v0.0.198) (2026-01-04)
## [0.0.197](https://github.com/bamiyanapp/karuta/compare/v1.9.3...v0.0.197) (2026-01-04)

### Bug Fixes

* ensure next card is displayed correctly ([58c1f9f](https://github.com/bamiyanapp/karuta/commit/58c1f9f29486284bae32af9920a4f7e38e67678b))
## [0.0.195](https://github.com/bamiyanapp/karuta/compare/v0.0.194...v0.0.195) (2026-01-04)

### Bug Fixes

* preserve averageDifficulty during seed ([8037593](https://github.com/bamiyanapp/karuta/commit/80375939c355a8ffded749fcc364b99844a03385))
## [0.0.194](https://github.com/bamiyanapp/karuta/compare/v1.9.2...v0.0.194) (2026-01-04)

### Reverts

* restore setTimeout based implementation to fix playback issues ([aa65809](https://github.com/bamiyanapp/karuta/commit/aa658099f5ae105a2f36b40fbea3a0a1da3edea6))
## [0.0.192](https://github.com/bamiyanapp/karuta/compare/v1.9.1...v0.0.192) (2026-01-04)

### Bug Fixes

* continue animation even if audio playback fails ([95b6fb6](https://github.com/bamiyanapp/karuta/commit/95b6fb671099f2062e6f0ec86c88329bd928a182))
## [0.0.190](https://github.com/bamiyanapp/karuta/compare/v0.0.189...v0.0.190) (2026-01-04)
## [0.0.189](https://github.com/bamiyanapp/karuta/compare/v0.0.188...v0.0.189) (2026-01-04)

### Bug Fixes

* ensure phrase transition even if audio is short ([c04ede8](https://github.com/bamiyanapp/karuta/commit/c04ede8d801fa4e6b38c6d3253d7ca9468df5544))
## [0.0.188](https://github.com/bamiyanapp/karuta/compare/v1.9.0...v0.0.188) (2026-01-04)
## [0.0.186](https://github.com/bamiyanapp/karuta/compare/v1.8.0...v0.0.186) (2026-01-04)

### Features

* praise when time is faster than average ([d9abd2b](https://github.com/bamiyanapp/karuta/commit/d9abd2bad5585e1c22cb71bafd0662a684dc133d))
## [0.0.184](https://github.com/bamiyanapp/karuta/compare/v1.7.2...v0.0.184) (2026-01-04)

### Features

* show result (time and difficulty) after pressing next button ([6bd8d21](https://github.com/bamiyanapp/karuta/commit/6bd8d21eb7f41a035592791d64ebb7b10f73746e))
## [0.0.182](https://github.com/bamiyanapp/karuta/compare/v1.7.1...v0.0.182) (2026-01-04)

### Bug Fixes

* record time correctly when skipping card animation ([9e52986](https://github.com/bamiyanapp/karuta/commit/9e5298606359e55f7992e8354b5923043e502cb5))
## [0.0.180](https://github.com/bamiyanapp/karuta/compare/v0.0.179...v0.0.180) (2026-01-04)

### Bug Fixes

* 読み上げ回数がカウントアップしない問題を修正 ([871ad6c](https://github.com/bamiyanapp/karuta/commit/871ad6c4246babf06732cf2afcfc7cb45f69fc1a))
## [0.0.179](https://github.com/bamiyanapp/karuta/compare/v1.7.0...v0.0.179) (2026-01-04)
## [0.0.177](https://github.com/bamiyanapp/karuta/compare/v1.6.0...v0.0.177) (2026-01-04)

### Features

* add averageTime to all-phrases list and increase list width ([99b62e2](https://github.com/bamiyanapp/karuta/commit/99b62e226c936ad56d98344697c5511e23207fc6))
## [0.0.175](https://github.com/bamiyanapp/karuta/compare/v0.0.174...v0.0.175) (2026-01-04)

### Features

* implement sort functionality for all-phrases list ([30ff588](https://github.com/bamiyanapp/karuta/commit/30ff588b97b17da6e703f178879bcd083f0919da))
## [0.0.174](https://github.com/bamiyanapp/karuta/compare/v1.5.0...v0.0.174) (2026-01-04)
## [0.0.172](https://github.com/bamiyanapp/karuta/compare/v0.0.171...v0.0.172) (2026-01-04)

### Features

* add readCount to all-phrases list ([ba48feb](https://github.com/bamiyanapp/karuta/commit/ba48feb12ea181fa2a6baf5f12bc400bd6e24536))
## [0.0.171](https://github.com/bamiyanapp/karuta/compare/v1.4.2...v0.0.171) (2026-01-04)

### Bug Fixes

* clear selectedCategory when navigating back from all-phrases view ([488b6c5](https://github.com/bamiyanapp/karuta/commit/488b6c5d7f9ec504601ba63fe9a71ea9f77438c0))
## [0.0.169](https://github.com/bamiyanapp/karuta/compare/v1.4.1...v0.0.169) (2026-01-04)

### Bug Fixes

* remove duplicate changelog entry and format dates ([294edca](https://github.com/bamiyanapp/karuta/commit/294edcae66ab075906e9c07423bb0704d8b4720a))
## [0.0.167](https://github.com/bamiyanapp/karuta/compare/v1.4.0...v0.0.167) (2026-01-04)

### Bug Fixes

* prioritize detail view rendering over other views ([1948f48](https://github.com/bamiyanapp/karuta/commit/1948f480ed95f527d2cb2117bb89284ccba5854d))
## [0.0.165](https://github.com/bamiyanapp/karuta/compare/v1.3.0...v0.0.165) (2026-01-04)

### Features

* add all-phrases view page and update backend to return necessary data ([5d83132](https://github.com/bamiyanapp/karuta/commit/5d831323741332e788c0d2c0f4ee5f5933648355))
## [0.0.163](https://github.com/bamiyanapp/karuta/compare/v1.2.0...v0.0.163) (2026-01-04)

### Features

* use averageDifficulty for sorting easy/hard order ([b3b5f9d](https://github.com/bamiyanapp/karuta/commit/b3b5f9df53f063f2583c627bd32f061a24b2c12f))
## [0.0.161](https://github.com/bamiyanapp/karuta/compare/v0.0.160...v0.0.161) (2026-01-04)
## [0.0.160](https://github.com/bamiyanapp/karuta/compare/v0.0.159...v0.0.160) (2026-01-04)

### Features

* implement difficulty estimation logic and display ([10164e0](https://github.com/bamiyanapp/karuta/commit/10164e0f52fd26bab43a0ea727f33a4e32aaf531))
## [0.0.159](https://github.com/bamiyanapp/karuta/compare/v0.0.158...v0.0.159) (2026-01-04)
## [0.0.158](https://github.com/bamiyanapp/karuta/compare/v0.0.157...v0.0.158) (2026-01-04)
## [0.0.157](https://github.com/bamiyanapp/karuta/compare/v0.0.156...v0.0.157) (2026-01-04)
## [0.0.155](https://github.com/bamiyanapp/karuta/compare/v1.1.1...v0.0.155) (2026-01-04)
## [0.0.153](https://github.com/bamiyanapp/karuta/compare/v1.1.0...v0.0.153) (2026-01-04)

### Bug Fixes

* render changelog as markdown using react-markdown ([13a7f74](https://github.com/bamiyanapp/karuta/commit/13a7f74e6b6f1135e1a19aa8f51eb72ccd1b27bf))
## [0.0.151](https://github.com/bamiyanapp/karuta/compare/v0.0.150...v0.0.151) (2026-01-04)
## [0.0.150](https://github.com/bamiyanapp/karuta/compare/v0.0.149...v0.0.150) (2026-01-04)
## [0.0.149](https://github.com/bamiyanapp/karuta/compare/v0.0.148...v0.0.149) (2026-01-04)
## [0.0.148](https://github.com/bamiyanapp/karuta/compare/v0.0.147...v0.0.148) (2026-01-04)

### Features

* JSON形式での更新履歴生成とアプリ内表示の追加 ([8c69bf7](https://github.com/bamiyanapp/karuta/commit/8c69bf7450497d891651781b1e3a58779ea65cc9))
## [0.0.147](https://github.com/bamiyanapp/karuta/compare/v0.0.146...v0.0.147) (2026-01-04)

### Features

* semantic-releaseの導入とリリースノートへのリンク追加 ([798cade](https://github.com/bamiyanapp/karuta/commit/798cadeb43ed9f3f3d6b13d7837d7bd198aea6c6))
## [0.0.146](https://github.com/bamiyanapp/karuta/compare/v0.0.145...v0.0.146) (2026-01-03)
## [0.0.145](https://github.com/bamiyanapp/karuta/compare/v0.0.144...v0.0.145) (2026-01-03)
## [0.0.144](https://github.com/bamiyanapp/karuta/compare/v0.0.143...v0.0.144) (2026-01-03)
## [0.0.143](https://github.com/bamiyanapp/karuta/compare/v0.0.142...v0.0.143) (2026-01-03)
## [0.0.142](https://github.com/bamiyanapp/karuta/compare/v0.0.141...v0.0.142) (2026-01-03)
## [0.0.141](https://github.com/bamiyanapp/karuta/compare/v0.0.140...v0.0.141) (2026-01-03)
## [0.0.140](https://github.com/bamiyanapp/karuta/compare/v0.0.139...v0.0.140) (2026-01-03)

### Bug Fixes

* アニメーション切り替え不具合と最初の札の表示遅延を修正 ([3a41c58](https://github.com/bamiyanapp/karuta/commit/3a41c58acef5ed883509caa0850f7af21fbe8cad))
## [0.0.139](https://github.com/bamiyanapp/karuta/compare/v0.0.138...v0.0.139) (2026-01-03)

### Bug Fixes

* 1枚目の札の表示遅延を確実に適用 ([3612870](https://github.com/bamiyanapp/karuta/commit/361287003924b15a8331d6a09bbb68c9b77727c9))
## [0.0.138](https://github.com/bamiyanapp/karuta/compare/v0.0.137...v0.0.138) (2026-01-03)

### Features

* CSV更新時にDynamoDBの統計情報を引き継ぐようにseed.jsを修正し、csvから統計列を削除 ([7f24486](https://github.com/bamiyanapp/karuta/commit/7f244868898510e9b9ef35fc4f900c9752c52d83))
## [0.0.137](https://github.com/bamiyanapp/karuta/compare/v0.0.136...v0.0.137) (2026-01-03)

### Features

* DynamoDBのキー構造変更への対応と移行スクリプトの追加、およびgitignoreの更新 ([46efd92](https://github.com/bamiyanapp/karuta/commit/46efd9289057529e24fb84e8ccd85161ba26f499))
## [0.0.136](https://github.com/bamiyanapp/karuta/compare/v0.0.135...v0.0.136) (2026-01-03)
## [0.0.135](https://github.com/bamiyanapp/karuta/compare/v0.0.134...v0.0.135) (2026-01-03)

### ⚠ BREAKING CHANGES

* Major update introduced by feat: DynamoDBのキー構造変更（categoryをパーティションキーに変更）への対応

### Features

* DynamoDBのキー構造変更（categoryをパーティションキーに変更）への対応 ([dcd5647](https://github.com/bamiyanapp/karuta/commit/dcd56476e694d3c04b3994b51c814a4ae3cec21a))
## [0.0.134](https://github.com/bamiyanapp/karuta/compare/v0.0.133...v0.0.134) (2026-01-03)

### Features

* めくりアニメーションをフェードイン・アウトに修正し、最初の札も遅延表示されるように修正 ([fc38466](https://github.com/bamiyanapp/karuta/commit/fc38466455fa9cbf07c848c9141479722e664751))
## [0.0.133](https://github.com/bamiyanapp/karuta/compare/v0.0.132...v0.0.133) (2026-01-03)
## [0.0.132](https://github.com/bamiyanapp/karuta/compare/v0.0.131...v0.0.132) (2026-01-03)

### Features

* めくりアニメーションをフェードイン・アウトに修正し、札の表示遅延を確実に適用 ([49816fd](https://github.com/bamiyanapp/karuta/commit/49816fd6609e6ae6e562e5cb8d1eaef643b272b0))
## [0.0.131](https://github.com/bamiyanapp/karuta/compare/v0.0.130...v0.0.131) (2026-01-03)

### Bug Fixes

* カードめくりアニメーションの重複実行を防止 ([a80dc84](https://github.com/bamiyanapp/karuta/commit/a80dc842bfe6f8162156b0847232704039227c52))
## [0.0.130](https://github.com/bamiyanapp/karuta/compare/v0.0.129...v0.0.130) (2026-01-03)

### Bug Fixes

* 1枚目の札の表示を3秒遅延させるように修正 ([3355845](https://github.com/bamiyanapp/karuta/commit/3355845f88ce789eace55bfd1ce4dcee4c3c2bd3))
## [0.0.129](https://github.com/bamiyanapp/karuta/compare/v0.0.128...v0.0.129) (2026-01-03)
## [0.0.128](https://github.com/bamiyanapp/karuta/compare/v0.0.127...v0.0.128) (2026-01-03)

### Bug Fixes

* 1枚目の読み上げ表示を3秒遅延させ、詳細ページのスタイルと統計表示を修正 ([f31ceae](https://github.com/bamiyanapp/karuta/commit/f31ceae15b90cbfc9ce5fe6f0c326f97dae01cbd))
## [0.0.127](https://github.com/bamiyanapp/karuta/compare/v0.0.126...v0.0.127) (2026-01-03)

### Bug Fixes

* 詳細ページのカルタ表示スタイルを修正し、統計情報の表示を改善 ([46b0601](https://github.com/bamiyanapp/karuta/commit/46b0601361a3fcb07383b1b441084c1c0a4168d9))
## [0.0.126](https://github.com/bamiyanapp/karuta/compare/v0.0.125...v0.0.126) (2026-01-03)

### Bug Fixes

* カードめくりアニメーションが2回実行される不具合を修正 ([2560eca](https://github.com/bamiyanapp/karuta/commit/2560eca6c39d949f45ca2947efa4d3eed7e20f9f))
## [0.0.125](https://github.com/bamiyanapp/karuta/compare/v0.0.124...v0.0.125) (2026-01-03)

### ⚠ BREAKING CHANGES

* Major update introduced by feat: 読み上げ順のオプション（ランダム、簡単、難しい）を追加

### Features

* 読み上げ順のオプション（ランダム、簡単、難しい）を追加 ([e293675](https://github.com/bamiyanapp/karuta/commit/e2936757327c39292b154046a399b50b9336761f))
## [0.0.124](https://github.com/bamiyanapp/karuta/compare/v0.0.123...v0.0.124) (2026-01-03)

### ⚠ BREAKING CHANGES

* Major update introduced by feat: カルタの所要時間を計測・記録する機能を追加

### Features

* カルタの所要時間を計測・記録する機能を追加 ([e2734d3](https://github.com/bamiyanapp/karuta/commit/e2734d3cc744fd5a83e1f8f48f3a3527d3a0e2d3))
## [0.0.123](https://github.com/bamiyanapp/karuta/compare/v0.0.122...v0.0.123) (2026-01-03)

### Bug Fixes

* アニメーションの不具合を修正し、タイミングを調整 ([d061022](https://github.com/bamiyanapp/karuta/commit/d061022850e974ddfb9b68cd43f94da1fdf50f11))
## [0.0.122](https://github.com/bamiyanapp/karuta/compare/v0.0.121...v0.0.122) (2026-01-03)

### Bug Fixes

* アニメーションのタイミングを3秒に修正し、繰り返し処理される不具合を解消 ([217edad](https://github.com/bamiyanapp/karuta/commit/217edad693bf0c76f491f3bb39c31f976a396140))
## [0.0.121](https://github.com/bamiyanapp/karuta/compare/v0.0.120...v0.0.121) (2026-01-03)

### Features

* 読み上げ5秒後にカードがめくれるアニメーションを追加 ([615b051](https://github.com/bamiyanapp/karuta/commit/615b051a185bccc919fba54f024ab0217f4fe569))
## [0.0.120](https://github.com/bamiyanapp/karuta/compare/v0.0.119...v0.0.120) (2026-01-03)

### Features

* 読み上げ中に次の札を予約できるようにUIを改善 ([f7fffd0](https://github.com/bamiyanapp/karuta/commit/f7fffd0842ce10b2decfaba59233e0ded7b90579))
## [0.0.119](https://github.com/bamiyanapp/karuta/compare/v0.0.118...v0.0.119) (2026-01-03)

### Features

* 主キーを連番に変更し、CSV更新時にIDが変更されないように修正 ([bf0206e](https://github.com/bamiyanapp/karuta/commit/bf0206e2f99199124df4f673353882ca2a93b4c5))
## [0.0.118](https://github.com/bamiyanapp/karuta/compare/v0.0.117...v0.0.118) (2026-01-02)
## [0.0.117](https://github.com/bamiyanapp/karuta/compare/v0.0.116...v0.0.117) (2026-01-02)
## [0.0.116](https://github.com/bamiyanapp/karuta/compare/v0.0.115...v0.0.116) (2026-01-02)
## [0.0.115](https://github.com/bamiyanapp/karuta/compare/v0.0.114...v0.0.115) (2026-01-02)
## [0.0.114](https://github.com/bamiyanapp/karuta/compare/v0.0.113...v0.0.114) (2026-01-02)

### Bug Fixes

* lint errors ([f236ddd](https://github.com/bamiyanapp/karuta/commit/f236ddd8ca5107d9ec8a0d07798f4a7fa5d35164))
## [0.0.113](https://github.com/bamiyanapp/karuta/compare/v0.0.112...v0.0.113) (2026-01-02)
## [0.0.112](https://github.com/bamiyanapp/karuta/compare/v0.0.111...v0.0.112) (2026-01-02)
## [0.0.111](https://github.com/bamiyanapp/karuta/compare/v0.0.110...v0.0.111) (2026-01-02)
## [0.0.110](https://github.com/bamiyanapp/karuta/compare/v0.0.109...v0.0.110) (2026-01-02)
## [0.0.109](https://github.com/bamiyanapp/karuta/compare/v0.0.108...v0.0.109) (2026-01-02)
## [0.0.108](https://github.com/bamiyanapp/karuta/compare/v0.0.107...v0.0.108) (2026-01-02)
## [0.0.107](https://github.com/bamiyanapp/karuta/compare/v0.0.106...v0.0.107) (2026-01-02)
## [0.0.106](https://github.com/bamiyanapp/karuta/compare/v0.0.105...v0.0.106) (2026-01-02)
## [0.0.105](https://github.com/bamiyanapp/karuta/compare/v0.0.104...v0.0.105) (2026-01-02)
## [0.0.104](https://github.com/bamiyanapp/karuta/compare/v0.0.103...v0.0.104) (2026-01-02)
## [0.0.103](https://github.com/bamiyanapp/karuta/compare/v0.0.102...v0.0.103) (2026-01-02)
## [0.0.102](https://github.com/bamiyanapp/karuta/compare/v0.0.101...v0.0.102) (2026-01-02)
## [0.0.101](https://github.com/bamiyanapp/karuta/compare/v0.0.100...v0.0.101) (2026-01-02)
## [0.0.100](https://github.com/bamiyanapp/karuta/compare/v0.0.99...v0.0.100) (2026-01-02)
## [0.0.99](https://github.com/bamiyanapp/karuta/compare/v0.0.98...v0.0.99) (2026-01-02)

### Bug Fixes

* UI: Adjust English font size in detail view and fix modal button layout for mobile ([d194f3a](https://github.com/bamiyanapp/karuta/commit/d194f3a8a59b98ebfbad2997bcbd563855961f85))
## [0.0.98](https://github.com/bamiyanapp/karuta/compare/v0.0.97...v0.0.98) (2026-01-02)
## [0.0.97](https://github.com/bamiyanapp/karuta/compare/v0.0.96...v0.0.97) (2026-01-02)

### Bug Fixes

* Fix: Replace 'カルタ' with 'かるた' in UI text ([111a669](https://github.com/bamiyanapp/karuta/commit/111a66926c48998951d651de2af4a74aa68f955c))
## [0.0.96](https://github.com/bamiyanapp/karuta/compare/v0.0.95...v0.0.96) (2026-01-02)
## [0.0.95](https://github.com/bamiyanapp/karuta/compare/v0.0.94...v0.0.95) (2026-01-02)

### Features

* Feat: Add English phrase display in detail view while keeping Japanese display in game mode ([344c895](https://github.com/bamiyanapp/karuta/commit/344c8953f050340b62aa449ed7c54bffb37a8ae1))
## [0.0.94](https://github.com/bamiyanapp/karuta/compare/v0.0.93...v0.0.94) (2026-01-02)
## [0.0.93](https://github.com/bamiyanapp/karuta/compare/v0.0.92...v0.0.93) (2026-01-02)

### Bug Fixes

* Fix: Backend errors (DynamoDB keyword, speechRate, Polly engine) and Frontend undefined phrase error ([6247877](https://github.com/bamiyanapp/karuta/commit/6247877ee9b13ce5b664a04170d0725d389a1f7a))
## [0.0.92](https://github.com/bamiyanapp/karuta/compare/v0.0.91...v0.0.92) (2026-01-02)
## [0.0.91](https://github.com/bamiyanapp/karuta/compare/v0.0.90...v0.0.91) (2026-01-02)
## [0.0.90](https://github.com/bamiyanapp/karuta/compare/v0.0.89...v0.0.90) (2026-01-02)
## [0.0.89](https://github.com/bamiyanapp/karuta/compare/v0.0.88...v0.0.89) (2026-01-02)
## [0.0.88](https://github.com/bamiyanapp/karuta/compare/v0.0.87...v0.0.88) (2026-01-02)
## [0.0.87](https://github.com/bamiyanapp/karuta/compare/v0.0.86...v0.0.87) (2026-01-02)
## [0.0.86](https://github.com/bamiyanapp/karuta/compare/v0.0.85...v0.0.86) (2026-01-02)
## [0.0.85](https://github.com/bamiyanapp/karuta/compare/v0.0.84...v0.0.85) (2026-01-02)
## [0.0.84](https://github.com/bamiyanapp/karuta/compare/v0.0.83...v0.0.84) (2026-01-02)
## [0.0.83](https://github.com/bamiyanapp/karuta/compare/v0.0.82...v0.0.83) (2026-01-02)

### Bug Fixes

* カルタ札データの復元と英語翻訳の追加 (phrases.csv) ([b74280c](https://github.com/bamiyanapp/karuta/commit/b74280cd2f16d26e258371fa9a58c2fce4a65bed))
## [0.0.82](https://github.com/bamiyanapp/karuta/compare/v0.0.81...v0.0.82) (2026-01-02)

### Features

* 読み上げ開始前に wadodon 音声を再生するように変更 ([cfa226d](https://github.com/bamiyanapp/karuta/commit/cfa226d7dba7c0d2affc3fe41cb2d1e57eaffe33))
## [0.0.81](https://github.com/bamiyanapp/karuta/compare/v0.0.80...v0.0.81) (2026-01-02)

### Features

* Add files via upload ([a2fbcad](https://github.com/bamiyanapp/karuta/commit/a2fbcad7bb1f93bb8a49124f7cbaa890cebdbf7e))
## [0.0.80](https://github.com/bamiyanapp/karuta/compare/v0.0.79...v0.0.80) (2026-01-02)
## [0.0.79](https://github.com/bamiyanapp/karuta/compare/v0.0.78...v0.0.79) (2026-01-02)
## [0.0.78](https://github.com/bamiyanapp/karuta/compare/v0.0.77...v0.0.78) (2026-01-02)

### Bug Fixes

* カルタ名称の表示化け対策 (notranslate追加) ([78210d9](https://github.com/bamiyanapp/karuta/commit/78210d975009bceff3e17c03ff802e9ce6356744))
## [0.0.77](https://github.com/bamiyanapp/karuta/compare/v0.0.76...v0.0.77) (2026-01-02)

### Bug Fixes

* カルタの札データの修正 (phrases.csv) ([5f43c46](https://github.com/bamiyanapp/karuta/commit/5f43c462741cd77dec17e94b3a50e3300d99d2ec))
## [0.0.76](https://github.com/bamiyanapp/karuta/compare/v0.0.75...v0.0.76) (2026-01-02)
## [0.0.75](https://github.com/bamiyanapp/karuta/compare/v0.0.74...v0.0.75) (2026-01-02)

### ⚠ BREAKING CHANGES

* Major update introduced by feat: コメント投稿機能と指摘一覧ページの追加

### Features

* コメント投稿機能と指摘一覧ページの追加 ([06af063](https://github.com/bamiyanapp/karuta/commit/06af0635bad7711b7829547e9c33d9421aad0bc3))
## [0.0.74](https://github.com/bamiyanapp/karuta/compare/v0.0.73...v0.0.74) (2026-01-02)

### Features

* カルタ説明ページ（詳細画面）の追加 ([60fef9b](https://github.com/bamiyanapp/karuta/commit/60fef9b35e144323c297b64891858fb9ac528f9d))
## [0.0.73](https://github.com/bamiyanapp/karuta/compare/v0.0.72...v0.0.73) (2026-01-02)

### Bug Fixes

* トップ画面のアイコン表示を修正 ([51ab226](https://github.com/bamiyanapp/karuta/commit/51ab2261a9fd3f5ce4ffbf5a685c1031c2c6c8c6))
## [0.0.72](https://github.com/bamiyanapp/karuta/compare/v0.0.71...v0.0.72) (2026-01-02)

### Bug Fixes

* アイコンのリンク切れ修正と読み上げスピードの基準調整 ([ed33f97](https://github.com/bamiyanapp/karuta/commit/ed33f97ec2399390a5c6ff25e8340a50322f1558))
## [0.0.71](https://github.com/bamiyanapp/karuta/compare/v0.0.70...v0.0.71) (2026-01-02)

### Features

* 全読了時の音声追加、読み上げ設定の強化、およびシステム安定性の向上 ([612be9a](https://github.com/bamiyanapp/karuta/commit/612be9a424514e285967c99e2de2d599e6c85289))
## [0.0.70](https://github.com/bamiyanapp/karuta/compare/v0.0.69...v0.0.70) (2026-01-02)
## [0.0.69](https://github.com/bamiyanapp/karuta/compare/v0.0.68...v0.0.69) (2026-01-02)
## [0.0.68](https://github.com/bamiyanapp/karuta/compare/v0.0.67...v0.0.68) (2026-01-02)
## [0.0.67](https://github.com/bamiyanapp/karuta/compare/v0.0.66...v0.0.67) (2026-01-02)
## [0.0.66](https://github.com/bamiyanapp/karuta/compare/v0.0.65...v0.0.66) (2026-01-02)
## [0.0.65](https://github.com/bamiyanapp/karuta/compare/v0.0.64...v0.0.65) (2026-01-02)
## [0.0.64](https://github.com/bamiyanapp/karuta/compare/v0.0.63...v0.0.64) (2026-01-02)
## [0.0.63](https://github.com/bamiyanapp/karuta/compare/v0.0.62...v0.0.63) (2026-01-02)
## [0.0.62](https://github.com/bamiyanapp/karuta/compare/v0.0.61...v0.0.62) (2026-01-02)
## [0.0.61](https://github.com/bamiyanapp/karuta/compare/v0.0.60...v0.0.61) (2026-01-02)

### ⚠ BREAKING CHANGES

* Major update introduced by feat: 複数カルタ対応、UI/UXの改善、および読み上げ機能の強化

### Features

* 複数カルタ対応、UI/UXの改善、および読み上げ機能の強化 ([b595658](https://github.com/bamiyanapp/karuta/commit/b59565848a55eea601965f7d8abbd872b6bea589))
## [0.0.60](https://github.com/bamiyanapp/karuta/compare/v0.0.59...v0.0.60) (2026-01-02)
## [0.0.59](https://github.com/bamiyanapp/karuta/compare/v0.0.58...v0.0.59) (2026-01-02)
## [0.0.58](https://github.com/bamiyanapp/karuta/compare/v0.0.57...v0.0.58) (2026-01-02)
## [0.0.57](https://github.com/bamiyanapp/karuta/compare/v0.0.56...v0.0.57) (2026-01-02)
## [0.0.56](https://github.com/bamiyanapp/karuta/compare/v0.0.55...v0.0.56) (2026-01-02)
## [0.0.55](https://github.com/bamiyanapp/karuta/compare/v0.0.54...v0.0.55) (2026-01-02)
## [0.0.54](https://github.com/bamiyanapp/karuta/compare/v0.0.53...v0.0.54) (2026-01-02)
## [0.0.53](https://github.com/bamiyanapp/karuta/compare/v0.0.52...v0.0.53) (2026-01-02)
## [0.0.52](https://github.com/bamiyanapp/karuta/compare/v0.0.51...v0.0.52) (2026-01-02)
## [0.0.51](https://github.com/bamiyanapp/karuta/compare/v0.0.50...v0.0.51) (2026-01-02)
## [0.0.50](https://github.com/bamiyanapp/karuta/compare/v0.0.49...v0.0.50) (2026-01-01)
## [0.0.49](https://github.com/bamiyanapp/karuta/compare/v0.0.48...v0.0.49) (2026-01-01)
## [0.0.48](https://github.com/bamiyanapp/karuta/compare/v0.0.47...v0.0.48) (2026-01-01)
## [0.0.47](https://github.com/bamiyanapp/karuta/compare/v0.0.46...v0.0.47) (2026-01-01)
## [0.0.46](https://github.com/bamiyanapp/karuta/compare/v0.0.45...v0.0.46) (2026-01-01)
## [0.0.45](https://github.com/bamiyanapp/karuta/compare/v0.0.44...v0.0.45) (2026-01-01)
## [0.0.44](https://github.com/bamiyanapp/karuta/compare/v0.0.43...v0.0.44) (2026-01-01)
## [0.0.43](https://github.com/bamiyanapp/karuta/compare/v0.0.42...v0.0.43) (2026-01-01)
## [0.0.42](https://github.com/bamiyanapp/karuta/compare/v0.0.41...v0.0.42) (2026-01-01)
## [0.0.41](https://github.com/bamiyanapp/karuta/compare/v0.0.40...v0.0.41) (2026-01-01)
## [0.0.40](https://github.com/bamiyanapp/karuta/compare/v0.0.39...v0.0.40) (2026-01-01)
## [0.0.39](https://github.com/bamiyanapp/karuta/compare/v0.0.38...v0.0.39) (2026-01-01)
## [0.0.38](https://github.com/bamiyanapp/karuta/compare/v0.0.37...v0.0.38) (2026-01-01)
## [0.0.37](https://github.com/bamiyanapp/karuta/compare/v0.0.36...v0.0.37) (2026-01-01)
## [0.0.36](https://github.com/bamiyanapp/karuta/compare/v0.0.35...v0.0.36) (2026-01-01)
## [0.0.35](https://github.com/bamiyanapp/karuta/compare/v0.0.34...v0.0.35) (2026-01-01)
## [0.0.34](https://github.com/bamiyanapp/karuta/compare/v0.0.33...v0.0.34) (2026-01-01)
## [0.0.33](https://github.com/bamiyanapp/karuta/compare/v0.0.32...v0.0.33) (2026-01-01)
## [0.0.32](https://github.com/bamiyanapp/karuta/compare/v0.0.31...v0.0.32) (2026-01-01)
## [0.0.31](https://github.com/bamiyanapp/karuta/compare/v0.0.30...v0.0.31) (2026-01-01)
## [0.0.30](https://github.com/bamiyanapp/karuta/compare/v0.0.29...v0.0.30) (2026-01-01)
## [0.0.29](https://github.com/bamiyanapp/karuta/compare/v0.0.28...v0.0.29) (2026-01-01)
## [0.0.28](https://github.com/bamiyanapp/karuta/compare/v0.0.27...v0.0.28) (2026-01-01)
## [0.0.27](https://github.com/bamiyanapp/karuta/compare/v0.0.26...v0.0.27) (2026-01-01)
## [0.0.26](https://github.com/bamiyanapp/karuta/compare/v0.0.25...v0.0.26) (2026-01-01)
## [0.0.25](https://github.com/bamiyanapp/karuta/compare/v0.0.24...v0.0.25) (2026-01-01)
## [0.0.24](https://github.com/bamiyanapp/karuta/compare/v0.0.23...v0.0.24) (2026-01-01)
## [0.0.23](https://github.com/bamiyanapp/karuta/compare/v0.0.22...v0.0.23) (2026-01-01)
## [0.0.22](https://github.com/bamiyanapp/karuta/compare/v0.0.21...v0.0.22) (2026-01-01)
## [0.0.21](https://github.com/bamiyanapp/karuta/compare/v0.0.20...v0.0.21) (2026-01-01)
## [0.0.20](https://github.com/bamiyanapp/karuta/compare/v0.0.19...v0.0.20) (2026-01-01)
## [0.0.19](https://github.com/bamiyanapp/karuta/compare/v0.0.18...v0.0.19) (2026-01-01)
## [0.0.18](https://github.com/bamiyanapp/karuta/compare/v0.0.17...v0.0.18) (2026-01-01)
## [0.0.17](https://github.com/bamiyanapp/karuta/compare/v0.0.16...v0.0.17) (2026-01-01)
## [0.0.16](https://github.com/bamiyanapp/karuta/compare/v0.0.15...v0.0.16) (2026-01-01)
## [0.0.15](https://github.com/bamiyanapp/karuta/compare/v0.0.14...v0.0.15) (2026-01-01)

### Bug Fixes

* Fix Polly presigned URL parameters manually ([05ff81f](https://github.com/bamiyanapp/karuta/commit/05ff81f5b42137305809bbeed3eb442cf6bfc0a7))
## [0.0.14](https://github.com/bamiyanapp/karuta/compare/v0.0.13...v0.0.14) (2026-01-01)
## [0.0.13](https://github.com/bamiyanapp/karuta/compare/v0.0.12...v0.0.13) (2026-01-01)
## [0.0.12](https://github.com/bamiyanapp/karuta/compare/v0.0.11...v0.0.12) (2026-01-01)

### Bug Fixes

* Ensure latest Lambda code is deployed and fix import ([5aa35d8](https://github.com/bamiyanapp/karuta/commit/5aa35d873940965f065de4e6b8525f6ed58e3ac4))
## [0.0.11](https://github.com/bamiyanapp/karuta/compare/v0.0.10...v0.0.11) (2026-01-01)

### Bug Fixes

* Fix Lambda getSignedUrl import and redeploy ([0ab104d](https://github.com/bamiyanapp/karuta/commit/0ab104de3bce06021e20ef13525af8ba0f57129c))
## [0.0.10](https://github.com/bamiyanapp/karuta/compare/v0.0.9...v0.0.10) (2026-01-01)
## [0.0.9](https://github.com/bamiyanapp/karuta/compare/v0.0.8...v0.0.9) (2026-01-01)
## [0.0.8](https://github.com/bamiyanapp/karuta/compare/v0.0.7...v0.0.8) (2026-01-01)
## [0.0.7](https://github.com/bamiyanapp/karuta/compare/v0.0.6...v0.0.7) (2026-01-01)
## [0.0.6](https://github.com/bamiyanapp/karuta/compare/v0.0.5...v0.0.6) (2026-01-01)
## [0.0.5](https://github.com/bamiyanapp/karuta/compare/v0.0.4...v0.0.5) (2026-01-01)
## [0.0.4](https://github.com/bamiyanapp/karuta/compare/v0.0.3...v0.0.4) (2026-01-01)
## [0.0.3](https://github.com/bamiyanapp/karuta/compare/v0.0.2...v0.0.3) (2026-01-01)
## [0.0.2](https://github.com/bamiyanapp/karuta/compare/v0.0.1...v0.0.2) (2026-01-01)
## 0.0.1 (2026-01-01)
