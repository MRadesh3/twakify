import { getAllContacts } from "@/apis/Auth/authApis.js";
import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import React, { useEffect, useState } from "react";
import { BiArrowBack, BiSearchAlt2 } from "react-icons/bi";
import ChatLIstItem from "./ChatLIstItem";

function ContactsList() {
  const [allContacts, setAllContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchContacts, setSearchContacts] = useState([]);
  const [{}, dispatch] = useStateProvider();

  useEffect(() => {
    if (searchTerm.length) {
      const filteredData = {};
      Object.keys(allContacts).forEach((key) => {
        filteredData[key] = allContacts[key].filter((obj) =>
          obj.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setSearchContacts(filteredData);
    } else {
      setSearchContacts(allContacts);
    }
  }, [searchTerm, allContacts]);

  const fetchAllContacts = async () => {
    try {
      const response = await getAllContacts({});
      if (response?.data?.status) {
        setAllContacts(response?.data?.data);
        setSearchContacts(response?.data?.data);
      }
    } catch (error) {
      console.log("Error fetching contacts", error);
    }
  };

  const normalizedArray = Object.values(allContacts).flat();

  console.log(normalizedArray);

  useEffect(() => {
    fetchAllContacts();
  }, []);

  const isEmpty =
    Object.keys(searchContacts).length === 0 ||
    Object.values(searchContacts).every((list) => list.length === 0);

  return (
    <div className="h-full flex flex-col">
      <div className="h-24 flex items-end px-3 py-4">
        <div className="flex items-center gap-12 text-white">
          <BiArrowBack
            className="text-xl cursor-pointer"
            onClick={() =>
              dispatch({
                type: reducerCases.SET_ALL_CONTACTS_PAGE,
              })
            }
          />
          <span>New Chat</span>
        </div>
      </div>

      <div className="bg-search-input-container-background h-full flex-auto overflow-auto custom-scrollbar">
        <div className="flex py-3 items-center gap-3 h-14">
          <div className="bg-panel-header-background flex items-center gap-5 px-3 py-1 rounded-lg flex-grow mx-4">
            <div>
              <BiSearchAlt2 className="text-panel-header-icon cursor-pointer text-lg" />
            </div>
            <div>
              <input
                type="text"
                placeholder="Search contacts"
                className="bg-transparent text-sm focus:outline-none text-white w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {isEmpty ? (
          <div className="text-center text-gray-500 py-10">
            {`No contacts found for search '${searchTerm}'`}
          </div>
        ) : (
          Object.entries(searchContacts).map(
            ([initialLetter, contactsList]) => {
              return (
                <>
                  {contactsList.length > 0 && (
                    <div key={initialLetter}>
                      <div className="text-teal-light pl-10 py-5">
                        {initialLetter}
                      </div>
                      {contactsList.map((contact) => (
                        <ChatLIstItem
                          key={contact.id}
                          data={contact}
                          isContactPage={true}
                        />
                      ))}
                    </div>
                  )}
                </>
              );
            }
          )
        )}
      </div>
    </div>
  );
}

export default ContactsList;
