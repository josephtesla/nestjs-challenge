import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { MusicBrainzService } from './musicbrainz.service';
import { of } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AppCacheModule } from 'src/common/cache';

describe('MusicBrainzService', () => {
  let mbService: MusicBrainzService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppCacheModule],
      providers: [
        MusicBrainzService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'musicBrainz.apiUrl' ? 'https://musicbrainz.org/ws/2' : undefined,
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn().mockReturnValue(of({ data: sampleXml })), // mock xml response
          },
        },
      ],
    }).compile();

    mbService = module.get(MusicBrainzService);
  });

  it('Should correctly parse track titles', async () => {
    const testmbid = 'bbc1f8b2-3d4e-4f5a-8b6c-7d8e9f0a1b2c';
    const list = await mbService.getTracklistFromApi(testmbid);
    expect(list).toEqual([
      'Drop the Other',
      "Drop the Other (Scuba's Vulpin remix)",
      'Double Edge (GeRM remix)',
      'Double Edge (GeRM remix instrumental)',
    ]);
  });
});

const sampleXml = `
<metadata
	xmlns="http://musicbrainz.org/ns/mmd-2.0#">
	<release id="23ca7e2b-3680-424c-b61b-08654dacefc4">
		<title>Drop the Other</title>
		<status id="4e304316-386d-3409-af2e-78857eec5cfe">Official</status>
		<quality>normal</quality>
		<packaging id="119eba76-b343-3e02-a292-f0f00644bb9b">None</packaging>
		<text-representation>
			<language>eng</language>
			<script>Latn</script>
		</text-representation>
		<date>2010-01-18</date>
		<country>XW</country>
		<release-event-list count="1">
			<release-event>
				<date>2010-01-18</date>
				<area id="525d4e18-3d00-31b9-a58b-a146a916de8f">
					<name>[Worldwide]</name>
					<sort-name>[Worldwide]</sort-name>
					<iso-3166-1-code-list>
						<iso-3166-1-code>XW</iso-3166-1-code>
					</iso-3166-1-code-list>
				</area>
			</release-event>
		</release-event-list>
		<barcode>5021392556192</barcode>
		<cover-art-archive>
			<artwork>true</artwork>
			<count>1</count>
			<front>true</front>
			<back>false</back>
		</cover-art-archive>
		<medium-list count="1">
			<medium id="1ea9c53c-26bb-4780-a70e-b088d8992994">
				<position>1</position>
				<format id="907a28d9-b3b2-3ef6-89a8-7b18d91d4794">Digital Media</format>
				<track-list count="4" offset="0">
					<track id="033978eb-58fe-41b9-b860-b78978c48c78">
						<position>1</position>
						<number>1</number>
						<length>207000</length>
						<recording id="d71c0c2c-eb32-4346-b6c9-81034c75ee41">
							<title>Drop the Other</title>
							<length>208453</length>
							<first-release-date>2010-01-18</first-release-date>
						</recording>
					</track>
					<track id="d7ccede9-f260-48b0-946a-d07ad7587a55">
						<position>2</position>
						<number>2</number>
						<title>Drop the Other (Scuba's Vulpine remix)</title>
						<length>334333</length>
						<recording id="fe97fd38-94ce-4579-8a02-f09b00f1dce4">
							<title>Drop the Other (Scuba's Vulpin remix)</title>
							<length>334333</length>
							<first-release-date>2010-01-18</first-release-date>
						</recording>
					</track>
					<track id="c999836b-3293-43a6-8aae-574f2cf51dec">
						<position>3</position>
						<number>3</number>
						<length>315280</length>
						<recording id="376b04b1-2ed3-4cc6-82c0-fdf6b95d3095">
							<title>Double Edge (GeRM remix)</title>
							<length>315280</length>
							<first-release-date>2010-01-18</first-release-date>
						</recording>
					</track>
					<track id="782ec980-6ebe-4f45-ae05-66cc06a8b9a4">
						<position>4</position>
						<number>4</number>
						<length>313720</length>
						<recording id="62ff2200-6abc-41fe-9456-47486a99285e">
							<title>Double Edge (GeRM remix instrumental)</title>
							<length>313000</length>
							<first-release-date>2010-01-18</first-release-date>
						</recording>
					</track>
				</track-list>
			</medium>
		</medium-list>
	</release>
</metadata>
`;
