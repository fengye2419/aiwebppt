/**
 * 解析Markdown内容为幻灯片数据
 * @param {string} markdownContent Markdown内容字符串
 * @return {Array} 幻灯片对象数组
 */
export function parseMarkdownToSlides(markdownContent) {
    if (!markdownContent) {
        return [];
    }

    // 使用 --- 分隔幻灯片
    const slideTexts = markdownContent.split(/\n\s*---\s*\n/);

    return slideTexts.map((slideText, index) => {
        // 去除首尾空白
        slideText = slideText.trim();

        // 检查是否有标题（以 # 开头的行）
        const titleMatch = slideText.match(/^#+\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1].trim() : `幻灯片 ${index + 1}`;

        // 移除标题行
        let content = slideText.replace(/^#+\s+.+$/m, '').trim();

        // 检查是否为第一张幻灯片
        if (index === 0) {
            // 第一张幻灯片通常是标题幻灯片

            // 尝试查找副标题（二级标题）
            const subtitleMatch = slideText.match(/^##\s+(.+)$/m);
            let subtitle = '';
            if (subtitleMatch) {
                subtitle = subtitleMatch[1].trim();
                // 从内容中移除副标题
                content = content.replace(/^##\s+.+$/m, '').trim();
            }

            // 尝试查找作者信息（三级标题）
            const authorMatch = slideText.match(/^###\s+(.+)$/m);
            let author = '';
            if (authorMatch) {
                const authorText = authorMatch[1];
                if (authorText.startsWith('作者') || authorText.toLowerCase().includes('author')) {
                    author = authorText.replace(/^作者[：:]\s*/, '').replace(/^author[：:]\s*/i, '').trim();
                    // 从内容中移除作者信息
                    content = content.replace(/^###\s+.+$/m, '').trim();
                }
            }

            return {
                type: 'title',
                title,
                subtitle,
                author,
                content
            };
        }

        // 检查是否包含代码块
        if (content.includes('```')) {
            return {
                type: 'code',
                title,
                content: extractCodeBlock(content)
            };
        }

        // 检查是否包含列表项
        if (content.match(/^\s*[\*\-\+]\s+/m)) {
            const listItems = extractListItems(content);
            if (listItems.length > 0) {
                return {
                    type: 'bullets',
                    title,
                    content: listItems
                };
            }
        }

        // 默认为普通幻灯片
        return {
            type: 'normal',
            title,
            content
        };
    });
}

/**
 * 从内容中提取代码块
 * @param {string} content 幻灯片内容
 * @return {string} 代码块内容
 */
function extractCodeBlock(content) {
    const codeBlockMatch = content.match(/```(?:\w+)?\n([\s\S]+?)\n```/);
    return codeBlockMatch ? codeBlockMatch[1].trim() : content;
}

/**
 * 从内容中提取列表项
 * @param {string} content 幻灯片内容
 * @return {Array} 列表项数组
 */
function extractListItems(content) {
    const lines = content.split('\n');
    const listItems = [];

    for (const line of lines) {
        const listItemMatch = line.match(/^\s*[\*\-\+]\s+(.+)$/);
        if (listItemMatch) {
            listItems.push(listItemMatch[1].trim());
        }
    }

    return listItems;
} 