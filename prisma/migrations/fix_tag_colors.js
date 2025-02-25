const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const tags = await prisma.tag.findMany();

  for (const tag of tags) {
    if (!tag.color) continue;

    try {
      // 既存の色情報が単純な文字列の場合（例：#EC4899）
      const color = tag.color.startsWith('"')
        ? JSON.parse(tag.color)
        : tag.color;

      // 新しい形式のTagColorオブジェクトを作成
      const newColor = {
        bg: color.startsWith('#') ? `${color}15` : color, // 既存の色に15%の透明度を追加
        color: color.startsWith('#') ? color : color,
      };

      // タグを更新
      await prisma.tag.update({
        where: { id: tag.id },
        data: { color: JSON.stringify(newColor) },
      });

      console.log(
        `Updated tag ${tag.id} with color ${tag.color} -> ${JSON.stringify(
          newColor
        )}`
      );
    } catch (error) {
      console.error(`Failed to update tag ${tag.id}:`, error);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
