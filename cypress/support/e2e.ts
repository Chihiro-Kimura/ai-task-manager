import '@testing-library/cypress/add-commands';

declare global {
  namespace Cypress {
    interface Chainable {
      // カスタムコマンドの型定義
      login(): Chainable<void>;
      dragAndDrop(
        source: string,
        target: string,
        options?: { force?: boolean }
      ): Chainable<void>;
    }
  }
}

// ログインのカスタムコマンド
Cypress.Commands.add('login', () => {
  cy.visit('/');
  // ログインボタンをクリック
  cy.findByRole('button', { name: /ログイン/i }).click();
  // ログイン処理の完了を待機
  cy.url().should('not.include', '/login');
});

// ドラッグ&ドロップのカスタムコマンド
Cypress.Commands.add(
  'dragAndDrop',
  (source: string, target: string, options = {}) => {
    cy.get(source).trigger('mousedown', { button: 0, ...options });
    cy.get(target)
      .trigger('mousemove', { ...options })
      .trigger('mouseup', { ...options });
  }
);
