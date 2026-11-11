import React from 'react';
import DescriptionList from 'Components/DescriptionList/DescriptionList';
import DescriptionListItemDescription from 'Components/DescriptionList/DescriptionListItemDescription';
import DescriptionListItemTitle from 'Components/DescriptionList/DescriptionListItemTitle';
import FieldSet from 'Components/FieldSet';
import Link from 'Components/Link/Link';
import translate from 'Utilities/String/translate';

function MoreInfo() {
  return (
    <FieldSet legend={translate('MoreInfo')}>
      <DescriptionList>
        <DescriptionListItemTitle>Materia</DescriptionListItemTitle>
        <DescriptionListItemDescription>
          <Link to="https://github.com/AnimaTheAeon/Materia">
            github.com/AnimaTheAeon/Materia
          </Link>
        </DescriptionListItemDescription>
        <DescriptionListItemTitle>Problems</DescriptionListItemTitle>
        <DescriptionListItemDescription>
          <Link to="https://github.com/AnimaTheAeon/Materia/issues">
            github.com/AnimaTheAeon/Materia/issues
          </Link>
        </DescriptionListItemDescription>
        <DescriptionListItemTitle>Help pages</DescriptionListItemTitle>
        <DescriptionListItemDescription>
          <Link to="https://wiki.servarr.com/prowlarr">
            wiki.servarr.com/prowlarr
          </Link>{' '}
          (Prowlarr&apos;s wiki; Materia works the same way)
        </DescriptionListItemDescription>
        <DescriptionListItemTitle>Based on</DescriptionListItemTitle>
        <DescriptionListItemDescription>
          <Link to="https://github.com/Prowlarr/Prowlarr">Prowlarr</Link>
        </DescriptionListItemDescription>
      </DescriptionList>
    </FieldSet>
  );
}

export default MoreInfo;
