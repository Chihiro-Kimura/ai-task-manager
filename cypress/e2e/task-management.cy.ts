describe('タスク管理機能', () => {
  beforeEach(() => {
    cy.login();
  });

  it('新しいタスクを作成できること', () => {
    // 新規タスク作成ボタンをクリック
    cy.findByRole('button', { name: /新規タスク/i }).click();

    // タスク情報を入力
    cy.findByLabelText(/タイトル/i).type('テストタスク');
    cy.findByLabelText(/説明/i).type('これはテストタスクです');
    cy.findByLabelText(/優先度/i).click();
    cy.findByRole('option', { name: /高/i }).click();
    cy.findByLabelText(/期限/i).type('2024-12-31');

    // 保存ボタンをクリック
    cy.findByRole('button', { name: /保存/i }).click();

    // タスクが作成されたことを確認
    cy.findByText('テストタスク').should('exist');
    cy.findByText('これはテストタスクです').should('exist');
  });

  it('タスクをドラッグ&ドロップで移動できること', () => {
    // BOXカラムのタスクをNOWカラムに移動
    cy.get('[data-rfd-draggable-id]').first().as('sourceTask');
    cy.get('[data-rfd-droppable-id="now"]').as('targetColumn');

    cy.get('@sourceTask')
      .trigger('mousedown', { button: 0 })
      .trigger('mousemove', { clientX: 500 })
      .get('@targetColumn')
      .trigger('mousemove')
      .trigger('mouseup');

    // タスクが移動したことを確認
    cy.get('[data-rfd-droppable-id="now"]')
      .find('[data-rfd-draggable-id]')
      .should('have.length.at.least', 1);
  });

  it('タスクをソートできること', () => {
    // BOXカラムのソートを優先度に変更
    cy.get('[data-testid="box-sort-select"]').click();
    cy.findByRole('option', { name: /優先度/i }).click();

    // 優先度順にソートされていることを確認
    cy.get('[data-rfd-droppable-id="box"]')
      .find('[data-rfd-draggable-id]')
      .first()
      .should('contain', '高');
  });

  it('タスクを編集できること', () => {
    // 最初のタスクの編集ボタンをクリック
    cy.get('[data-rfd-draggable-id]')
      .first()
      .find('button[aria-label="編集"]')
      .click();

    // タスク情報を更新
    cy.findByLabelText(/タイトル/i)
      .clear()
      .type('更新されたタスク');
    cy.findByLabelText(/説明/i).clear().type('これは更新後のタスクです');

    // 保存ボタンをクリック
    cy.findByRole('button', { name: /保存/i }).click();

    // タスクが更新されたことを確認
    cy.findByText('更新されたタスク').should('exist');
    cy.findByText('これは更新後のタスクです').should('exist');
  });

  it('タスクを削除できること', () => {
    // 削除前のタスク数を記録
    cy.get('[data-rfd-draggable-id]').its('length').as('initialCount');

    // 最初のタスクの削除ボタンをクリック
    cy.get('[data-rfd-draggable-id]')
      .first()
      .find('button[aria-label="削除"]')
      .click();

    // 削除確認ダイアログで確認
    cy.findByRole('button', { name: /削除/i }).click();

    // タスクが削除されたことを確認
    cy.get('@initialCount').then((initialCount) => {
      cy.get('[data-rfd-draggable-id]').should(
        'have.length',
        Number(initialCount) - 1
      );
    });
  });

  it('タスクの状態を切り替えられること', () => {
    // 最初のタスクの完了ボタンをクリック
    cy.get('[data-rfd-draggable-id]')
      .first()
      .find('button[aria-label="完了"]')
      .click();

    // タスクが完了状態になったことを確認
    cy.get('[data-rfd-draggable-id]')
      .first()
      .should('have.class', 'line-through');
  });
});
