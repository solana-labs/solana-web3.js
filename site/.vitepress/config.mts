import typedocSidebar from '../api/typedoc-sidebar.json';

function navItemComparator(a, b) {
    if (a.link.includes('/functions/') || b.link.includes('/functions/')) {
        if (!a.link.includes('/functions/')) {
            return 1;
        } else if (!b.link.includes('/functions/')) {
            return -1;
        }
    }
    return 0; // Delegate to the default sort.
}

function orderNavItems(items) {
    const sortedItems = items.sort(navItemComparator);
    return sortedItems.map(item => {
        if ('items' in item) {
            item.items = orderNavItems(item.items);
        }
        return item;
    });
}

function excludeInternal(items) {
    return items
        .map(item => {
            if (item.text === '<internal>') {
                return;
            }
            if ('items' in item) {
                item.items = excludeInternal(item.items);
            }
            return item;
        })
        .filter(Boolean);
}

export default {
    base: '/solana-web3.js/',
    description: 'Build Solana apps for the browser, the server, and React Native',
    title: 'Solana JavaScript SDK',
    titleTemplate: ':title &ndash; @solana/web3.js',
    themeConfig: {
        logo: { alt: 'Solana logo', src: '/logo.svg' },
        nav: [{ text: 'API', link: '/api/' }],
        siteTitle: 'Solana JavaScript SDK',
        sidebar: [
            {
                text: 'Packages',
                items: orderNavItems(excludeInternal(typedocSidebar)).sort((a, b) => {
                    if (a.text === '@solana/web3.js') {
                        return -1;
                    } else if (b.text === '@solana/web3.js') {
                        return 1;
                    }
                    return 0; // Delegate to default sort.
                }),
            },
        ],
    },
};
