import { describe, it, expect, beforeEach, vi } from 'vitest';
import { opsAlert } from './handler';

// CloudWatch Alarm → SNS → opsAlertハンドラ経由でLINEへ通知する部分の単体テスト
// （dev-standards/docs/ops-monitoring-pattern.md）。
// 実際のLINE APIは呼ばず、global.fetchをモックして検証する。

const buildSnsEvent = (alarmOverrides = {}) => ({
  Records: [
    {
      Sns: {
        Message: JSON.stringify({
          AlarmName: 'uchi-stock-app-prod-createItem-errors',
          NewStateValue: 'ALARM',
          NewStateReason: 'Threshold Crossed',
          ...alarmOverrides,
        }),
      },
    },
  ],
});

describe('handler.opsAlert', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.OPS_ALERT_LINE_CHANNEL_ACCESS_TOKEN;
    delete process.env.OPS_ALERT_LINE_USER_ID;
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('Secretsが設定済みの場合、LINE Messaging APIへ通知を送信する', async () => {
    process.env.OPS_ALERT_LINE_CHANNEL_ACCESS_TOKEN = 'dummy-token';
    process.env.OPS_ALERT_LINE_USER_ID = 'dummy-user';
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await opsAlert(buildSnsEvent());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.line.me/v2/bot/message/push');
    expect(options.headers.authorization).toBe('Bearer dummy-token');
    const body = JSON.parse(options.body);
    expect(body.to).toBe('dummy-user');
    expect(body.messages[0].text).toContain('uchi-stock');
    expect(body.messages[0].text).toContain('ALARM');
  });

  it('OPS_ALERT_LINE_CHANNEL_ACCESS_TOKEN/OPS_ALERT_LINE_USER_IDが未設定の場合、送信をスキップし例外を投げない', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(opsAlert(buildSnsEvent())).resolves.toBeUndefined();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
  });

  it('LINE API呼び出しが失敗しても例外を外へ伝播させない', async () => {
    process.env.OPS_ALERT_LINE_CHANNEL_ACCESS_TOKEN = 'dummy-token';
    process.env.OPS_ALERT_LINE_USER_ID = 'dummy-user';
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    vi.stubGlobal('fetch', fetchMock);

    await expect(opsAlert(buildSnsEvent())).resolves.toBeUndefined();

    expect(console.error).toHaveBeenCalled();
  });

  it('Recordsが空の場合も何も起きない', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(opsAlert({ Records: [] })).resolves.toBeUndefined();

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
