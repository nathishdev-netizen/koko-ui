/**
 * The Astryx boundary.
 *
 * ALL Astryx imports go through this file. Feature code imports from
 * '@/components/ui', never from '@astryxdesign/core/*' directly. That one
 * indirection is what makes a design-system swap or a component override a
 * change here rather than a change across every page.
 *
 * Re-export components as they are first needed rather than up front, so the
 * surface stays honest about what the app actually uses.
 */
export { AppShell } from '@astryxdesign/core/AppShell';
export { Badge } from '@astryxdesign/core/Badge';
export { Button } from '@astryxdesign/core/Button';
export { AspectRatio } from '@astryxdesign/core/AspectRatio';
export { Breadcrumbs, BreadcrumbItem } from '@astryxdesign/core/Breadcrumbs';
export { Card } from '@astryxdesign/core/Card';
export { Carousel } from '@astryxdesign/core/Carousel';
export { ClickableCard } from '@astryxdesign/core/ClickableCard';
export { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
export { Divider } from '@astryxdesign/core/Divider';
export { Grid } from '@astryxdesign/core/Grid';
export { Heading } from '@astryxdesign/core/Heading';
export { HStack } from '@astryxdesign/core/HStack';
export { Icon } from '@astryxdesign/core/Icon';
export { IconButton } from '@astryxdesign/core/IconButton';
export { Link } from '@astryxdesign/core/Link';
export { List, ListItem } from '@astryxdesign/core/List';
export { Collapsible, CollapsibleGroup } from '@astryxdesign/core/Collapsible';
export { EmptyState } from '@astryxdesign/core/EmptyState';
export { NavIcon } from '@astryxdesign/core/NavIcon';
export { Field } from '@astryxdesign/core/Field';
export { NumberInput } from '@astryxdesign/core/NumberInput';
export { RadioList, RadioListItem } from '@astryxdesign/core/RadioList';
export { TextArea } from '@astryxdesign/core/TextArea';
export { TextInput } from '@astryxdesign/core/TextInput';
export { Pagination } from '@astryxdesign/core/Pagination';
export { ProgressBar } from '@astryxdesign/core/ProgressBar';
export {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
export { SelectableCard } from '@astryxdesign/core/SelectableCard';
export { Selector, SelectorOption } from '@astryxdesign/core/Selector';
export { Skeleton } from '@astryxdesign/core/Skeleton';
export { Section } from '@astryxdesign/core/Section';
export { Stack } from '@astryxdesign/core/Stack';
export { Text } from '@astryxdesign/core/Text';
export { TopNav, TopNavHeading, TopNavItem } from '@astryxdesign/core/TopNav';
export { VStack } from '@astryxdesign/core/VStack';
export { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
