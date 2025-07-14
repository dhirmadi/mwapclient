import React from 'react';
import { Breadcrumbs as MantineBreadcrumbs, Anchor, Text, Group } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconChevronRight } from '@tabler/icons-react';

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Group mb="md">
      <MantineBreadcrumbs
        separator={<IconChevronRight size={14} />}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          if (isLast) {
            return (
              <Text key={index} size="sm" fw={500}>
                {item.title}
              </Text>
            );
          }
          
          return (
            <Anchor
              key={index}
              component={Link}
              to={item.href || '#'}
              size="sm"
            >
              {item.title}
            </Anchor>
          );
        })}
      </MantineBreadcrumbs>
    </Group>
  );
};

export default Breadcrumbs;