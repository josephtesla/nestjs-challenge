export const RecordSearchIndexDefinition = {
  mappings: {
    dynamic: false,
    fields: {
      album: {
        analyzer: 'lucene.standard',
        foldDiacritics: true,
        maxGrams: 15,
        minGrams: 2,
        tokenization: 'edgeGram',
        type: 'autocomplete',
      },
      artist: {
        analyzer: 'lucene.standard',
        foldDiacritics: true,
        maxGrams: 15,
        minGrams: 2,
        tokenization: 'edgeGram',
        type: 'autocomplete',
      },
      category: [
        {
          analyzer: 'lucene.standard',
          foldDiacritics: true,
          maxGrams: 15,
          minGrams: 2,
          tokenization: 'edgeGram',
          type: 'autocomplete',
        },
        {
          normalizer: 'lowercase',
          type: 'token',
        },
      ],
      format: {
        normalizer: 'lowercase',
        type: 'token',
      },
    },
  },
};
