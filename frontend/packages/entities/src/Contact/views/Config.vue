<script setup lang="ts">
import { Badge, ContentHeader, Icon, Tabs } from '@evac/ui'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import * as ContactGroup from '@/ContactGroup'
import * as def from '../definitions'
import { useState } from '../composables'
import * as Contact from '../components'

const DEFAULT_TAB = 'contacts'

const { t } = useI18n({ useScope: 'global' })
const { count: contactCount, list: contacts } = useState()
const { count: groupCount, list: groups } = ContactGroup.useState()
const tab = ref(DEFAULT_TAB)

const selected = ref(new Set<def.Detail>())
</script>

<template>
  <ContentHeader class="pb-0">
    <template #title>
      <h1 class="headline">{{ t('contacts.config.title') }}</h1>
      <Badge>{{ tab === 'contacts' ? contactCount : groupCount }}</Badge>
      <span class="grow" />
      <Contact.Dialog v-if="tab === 'contacts'" />
      <ContactGroup.Dialog v-else-if="tab === 'contactGroups'" />
    </template>
  </ContentHeader>

  <Tabs.Root v-model="tab" class="grid grid-rows-[max-content_1fr] @container/tabs container-type-size" unmount-on-hide>
    <Tabs.List class="flex gap-6 items-center justify-center relative border-b">
      <Tabs.Trigger value="contacts" class="btn" :aria-label="t('contacts.config.title')">
        <Icon :icon="def.ICON" class="mr-2" />
        {{ t('contacts.title') }}
      </Tabs.Trigger>
      <Tabs.Trigger value="contactGroups" class="btn" :aria-label="t('contactGroups.config.title')">
        <Icon :icon="ContactGroup.ICON" class="mr-2" />
        {{ t('contactGroups.title') }}
      </Tabs.Trigger>
      <Tabs.Indicator
        class="absolute px-8 left-0 h-[5px] bg-accent-blue bottom-0 w-(--reka-tabs-indicator-size) translate-x-(--reka-tabs-indicator-position) translate-y-[3px] rounded-full transition-[width,transform] duration-300"
      >
        <div class="bg-grass8 w-full h-full" />
      </Tabs.Indicator>
    </Tabs.List>
    <Tabs.Content value="contacts" class="px-6 pt-6 pb-12 overflow-y-auto">
      <Contact.Cards class="grid content-start items-center" :contacts="contacts">
        <template #item="{ contact }">
          <Contact.Dialog :contact="contact">
            <Contact.Card :contact="contact" />
          </Contact.Dialog>
        </template>
      </Contact.Cards>
    </Tabs.Content>
    <Tabs.Content value="contactGroups" class="px-6 pt-6 pb-12 overflow-y-auto">
      <ContactGroup.Cards class="grid content-start items-center" :contact-groups="groups">
        <template #item="{ contactGroup }">
          <ContactGroup.Dialog :contact-group="contactGroup">
            <ContactGroup.Card :contact-group="contactGroup" />
          </ContactGroup.Dialog>
        </template>
      </ContactGroup.Cards>
    </Tabs.Content>
  </Tabs.Root>
</template>
